import { useEffect, useState } from "react";
import type { SectionSchema } from "$server/models/book/section";

function useSortableSectionsProps(
  sections: SectionSchema[],
  onSubmit: (sections: SectionSchema[]) => void | Promise<void>
) {
  const [sortable, setSortable] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const handleSortableChange = () => setSortable(!sortable);
  const [sortableSections, setSortableSections] = useState<SectionSchema[]>([]);
  useEffect(() => {
    setSortableSections(sections);
  }, [setSortableSections, sections]);
  const handleSectionsUpdate = (sortableSections: SectionSchema[]) => {
    setSortableSections(sortableSections);
    setInProgress(true);
  };
  const handleSectionsReset = () => {
    setSortableSections(sections);
    setInProgress(false);
  };
  const handleSectionsSave = async () => {
    try {
      await onSubmit(sortableSections);
      setInProgress(false);
      setSortable(false);
    } catch {
      // 保存失敗時は編集モードを維持する
    }
  };
  const handleSectionCreate = () => {
    setSortableSections([
      ...sortableSections,
      {
        id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
        name: null,
        topics: [],
      },
    ]);
    setInProgress(true);
  };
  return {
    sortable,
    sortableSections,
    inProgress,
    handleSortableChange,
    handleSectionsUpdate,
    handleSectionsReset,
    handleSectionsSave,
    handleSectionCreate,
  };
}

export default useSortableSectionsProps;
