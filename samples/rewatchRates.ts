import user from "./user";
import topic from "./topic";
import type { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";

const rewatchRates: Array<ActivityRewatchRateProps> = [
  {
    topicId: topic.id,
    learnerId: user.id,
    rewatchRate: 0.725,
  },
];

export default rewatchRates;
