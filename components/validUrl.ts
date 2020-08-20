export const validUrl = (url: any) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};
