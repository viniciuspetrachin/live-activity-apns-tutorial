export type PushToStartTokenEvent = {
  pushToStartToken: string;
};

export type PushToUpdateTokenEvent = {
  activityId: string;
  pushToUpdateToken: string;
  /** attributes.key fixo do OrderAttributes */
  orderId: string;
};

export type ActiveActivity = {
  activityId: string;
  orderId: string;
  status: string;
  title: string;
  subtitle: string;
  progress: number;
};

export type LiveActivitiesModuleEvents = {
  pushToStartTokenDidChange: (event: PushToStartTokenEvent) => void;
  pushToUpdateTokenDidChange: (event: PushToUpdateTokenEvent) => void;
};
