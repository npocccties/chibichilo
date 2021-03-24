import { useState } from "react";
import { Filter } from "$types/filter";

const useFilter = () => useState<Filter>("self");

export default useFilter;
