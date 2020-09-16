type ContentsSchema = {
  id: number;
  title: string;
  videos: Array<Pick<VideoSchema, "id" | "title" | "creator">>;
};

type Contents = WithState<ContentsSchema>;

type ContentsIndexSchema = {
  contents: Array<
    Pick<ContentsSchema, "id" | "title"> & {
      creator: User["id"];
      updateAt: Date;
    }
  >;
};

type ContentsIndex = WithState<ContentsIndexSchema>;
