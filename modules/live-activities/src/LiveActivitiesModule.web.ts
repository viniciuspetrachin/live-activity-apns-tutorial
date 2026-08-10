import { NativeModule, registerWebModule } from 'expo';

import type {
  ActiveActivity,
  LiveActivitiesModuleEvents,
} from './LiveActivities.types';

class LiveActivitiesModule extends NativeModule<LiveActivitiesModuleEvents> {
  areActivitiesEnabled(): boolean {
    return false;
  }

  getPushToStartToken(): string | null {
    return null;
  }

  getActiveActivities(): ActiveActivity[] {
    return [];
  }

  startObservingTokens(): void {}
}

export default registerWebModule(LiveActivitiesModule, 'LiveActivities');
