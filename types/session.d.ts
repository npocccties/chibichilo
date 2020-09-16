type Session = User & {
  contents?: ContentsSchema["id"];
  lmsResource: string;
  lmsCourse: string;
};
