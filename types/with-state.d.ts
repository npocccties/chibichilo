type WithState<T> = T & {
  state: "pending" | "success" | "failure";
};
