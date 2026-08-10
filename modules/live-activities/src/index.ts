// PedidoVivo — Live Activities via APNs
// Copyright (c) 2026 Vinicius R. Petrarchin — MIT License

import type {
  ActiveActivity,
  PushToStartTokenEvent,
  PushToUpdateTokenEvent,
} from './LiveActivities.types';
import LiveActivitiesModule from './LiveActivitiesModule';

type EventSubscription = { remove(): void };

export function areActivitiesEnabled(): boolean {
  return LiveActivitiesModule.areActivitiesEnabled();
}

export function getPushToStartToken(): string | null {
  return LiveActivitiesModule.getPushToStartToken();
}

export function getActiveActivities(): ActiveActivity[] {
  return LiveActivitiesModule.getActiveActivities();
}

export function startObservingTokens(): void {
  LiveActivitiesModule.startObservingTokens();
}

export function addPushToStartTokenListener(
  listener: (event: PushToStartTokenEvent) => void,
): EventSubscription {
  return LiveActivitiesModule.addListener('pushToStartTokenDidChange', listener);
}

export function addPushToUpdateTokenListener(
  listener: (event: PushToUpdateTokenEvent) => void,
): EventSubscription {
  return LiveActivitiesModule.addListener(
    'pushToUpdateTokenDidChange',
    listener,
  );
}

export type {
  ActiveActivity,
  PushToStartTokenEvent,
  PushToUpdateTokenEvent,
};
