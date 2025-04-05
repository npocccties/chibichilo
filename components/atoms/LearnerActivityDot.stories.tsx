export default { title: "atoms/LearnerActivityDot" };

import LearnerActivityDot from "./LearnerActivityDot";
import { bookActivity, session } from "$samples";
import { rewatchRates } from "$samples";

export const Default = () => (
  <LearnerActivityDot
    activity={bookActivity}
    onActivityClick={console.log}
    session={session}
    rewatchRate={rewatchRates[0]}
  />
);
