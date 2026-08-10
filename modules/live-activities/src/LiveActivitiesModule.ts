import { NativeModule, requireNativeModule } from 'expo';

import type {
  ActiveActivity,
  LiveActivitiesModuleEvents,
} from './LiveActivities.types';

declare class LiveActivitiesModule extends NativeModule<LiveActivitiesModuleEvents> {
  areActivitiesEnabled(): boolean;
  getPushToStartToken(): string | null;
  getActiveActivities(): ActiveActivity[];
  startObservingTokens(): void;
}

export default requireNativeModule<LiveActivitiesModule>('LiveActivities');
