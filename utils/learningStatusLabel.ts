import type { LearningStatus } from "$server/models/learningStatus";

const learningStatusLabel: Readonly<{ [key in LearningStatus]: string }> = {
  completed: "完了",
  incompleted: "未完了",
  unopened: "未視聴",
};

export default learningStatusLabel;
