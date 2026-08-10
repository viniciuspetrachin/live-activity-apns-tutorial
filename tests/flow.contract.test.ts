/**
 * Tutorial flow contract (no Apple device required):
 * start → update → end only via APNs liveactivity.
 * The app does NOT call Activity.request / startActivity.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildEndPayload,
  buildStartPayload,
  buildUpdatePayload,
} from '../src/apnsPayloads';

const root = resolve(__dirname, '..');

function read(rel: string) {
  return readFileSync(resolve(root, rel), 'utf8');
}

describe('APNs-only flow contract', () => {
  it('Swift module does not start activity on the happy path', () => {
    const swift = read('modules/live-activities/ios/LiveActivitiesModule.swift');
    expect(swift).not.toMatch(/Activity\.request/);
    expect(swift).not.toMatch(/\.request\(/);
    expect(swift).toMatch(/pushToStartTokenUpdates/);
    expect(swift).toMatch(/pushTokenUpdates/);
  });

  it('module JS API does not expose startActivity', () => {
    const index = read('modules/live-activities/src/index.ts');
    expect(index).not.toMatch(/startActivity/);
    expect(index).toMatch(/addPushToStartTokenListener/);
    expect(index).toMatch(/addPushToUpdateTokenListener/);
  });

  it('push.ts uses expo-notifications (not the deprecated RNFB API)', () => {
    const push = read('src/push.ts');
    // Deprecated modular API: requestPermission(messaging, …)
    expect(push).not.toMatch(/requestPermission\s*\(/);
    expect(push).not.toMatch(/AuthorizationStatus/);
    expect(push).toMatch(/from 'expo-notifications'/);
    expect(push).toMatch(/requestPermissionsAsync/);
  });

  it('start → update → end sequence preserves orderId and schema', () => {
    const orderId = 'ord_demo';
    const start = buildStartPayload({
      orderId,
      contentState: {
        status: 'preparing',
        title: 'Order',
        subtitle: 'Preparing',
        progress: 0.2,
      },
      timestamp: 1,
    });
    const update = buildUpdatePayload({
      contentState: {
        status: 'on_the_way',
        title: 'Order',
        subtitle: 'On the way',
        progress: 0.6,
      },
      timestamp: 2,
    });
    const end = buildEndPayload({
      contentState: {
        status: 'delivered',
        title: 'Order',
        subtitle: 'Delivered',
        progress: 1,
      },
      timestamp: 3,
    });

    expect(start.aps.attributes.orderId).toBe(orderId);
    expect([start.aps.event, update.aps.event, end.aps.event]).toEqual([
      'start',
      'update',
      'end',
    ]);
    expect(end.aps['content-state'].status).toBe('delivered');
  });
});
