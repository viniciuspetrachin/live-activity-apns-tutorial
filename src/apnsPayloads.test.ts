import { describe, expect, it } from 'vitest';

import {
  assertLiveActivityToken,
  buildEndPayload,
  buildFcmLiveActivityMessage,
  buildLiveActivityHeaders,
  buildStartPayload,
  buildUpdatePayload,
  fcmSendUrl,
  liveActivityTopic,
} from './apnsPayloads';

const contentPreparing = {
  status: 'preparing',
  title: 'Order #123',
  subtitle: 'Preparing your order',
  progress: 0.25,
};

describe('APNs Live Activity payloads (100% push flow)', () => {
  it('builds the correct topic', () => {
    expect(liveActivityTopic('com.viniciuspetrachin.pedidovivo')).toBe(
      'com.viniciuspetrachin.pedidovivo.push-type.liveactivity',
    );
  });

  it('headers use apns-push-type liveactivity', () => {
    const headers = buildLiveActivityHeaders('com.example.app');
    expect(headers['apns-push-type']).toBe('liveactivity');
    expect(headers['apns-topic']).toBe('com.example.app.push-type.liveactivity');
  });

  it('start: attributes-type OrderAttributes + alert + content-state', () => {
    const payload = buildStartPayload({
      orderId: 'ord_123',
      contentState: contentPreparing,
      timestamp: 1710000000,
    });

    expect(payload.aps.event).toBe('start');
    expect(payload.aps['attributes-type']).toBe('OrderAttributes');
    expect(payload.aps.attributes).toEqual({ orderId: 'ord_123' });
    expect(payload.aps['content-state']).toEqual(contentPreparing);
    expect(payload.aps.alert.title).toBeTruthy();
    expect(payload.aps.timestamp).toBe(1710000000);
  });

  it('update: content-state only (no Activity.request on the client)', () => {
    const payload = buildUpdatePayload({
      contentState: {
        ...contentPreparing,
        status: 'on_the_way',
        subtitle: 'Out for delivery',
        progress: 0.7,
      },
      timestamp: 1710000060,
    });

    expect(payload.aps.event).toBe('update');
    expect(payload.aps).not.toHaveProperty('attributes-type');
    expect(payload.aps['content-state'].status).toBe('on_the_way');
  });

  it('end: event end + final content-state', () => {
    const payload = buildEndPayload({
      contentState: {
        status: 'delivered',
        title: 'Order #123',
        subtitle: 'Delivered',
        progress: 1,
      },
      timestamp: 1710000120,
      dismissalDate: 1710000180,
    });

    expect(payload.aps.event).toBe('end');
    expect(payload.aps['dismissal-date']).toBe(1710000180);
    expect(payload.aps['content-state'].progress).toBe(1);
  });

  it('rejects FCM token in place of Live Activity token', () => {
    expect(() =>
      assertLiveActivityToken('abc:APA91bFakeFcmToken', 'pushToStartToken'),
    ).toThrow(/FCM/);
  });

  it('accepts ActivityKit hex', () => {
    expect(() =>
      assertLiveActivityToken('deadbeef0123456789abcdef', 'pushToStartToken'),
    ).not.toThrow();
  });

  it('FCM envelope uses live_activity_token + FCM token', () => {
    const aps = buildStartPayload({
      orderId: 'ord_123',
      contentState: contentPreparing,
      timestamp: 1710000000,
    });
    const msg = buildFcmLiveActivityMessage({
      fcmToken: 'fcm-device-token',
      liveActivityToken: 'aabbccddeeff',
      apsPayload: aps,
    });

    expect(msg.message.token).toBe('fcm-device-token');
    expect(msg.message.apns.live_activity_token).toBe('aabbccddeeff');
    expect(msg.message.apns.payload.aps.event).toBe('start');
    expect(msg.message.apns.headers['apns-priority']).toBe('10');
    expect(fcmSendUrl('pedido-vivo')).toBe(
      'https://fcm.googleapis.com/v1/projects/pedido-vivo/messages:send',
    );
  });
});
