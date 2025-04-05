export default { title: "molecules/LearnerActivityItem" };

import LearnerActivityItem from "./LearnerActivityItem";
import { bookActivity } from "$samples";
import { session } from "$samples";
import { rewatchRates } from "$samples";

export const Default = () => (
  <LearnerActivityItem
    learner={bookActivity.learner}
    activities={[...Array(10)].map(() => bookActivity)}
    session={session}
    rewatchRates={rewatchRates}
  />
);
