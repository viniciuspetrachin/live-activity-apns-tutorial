/**
 * PedidoVivo — Live Activities via APNs
 * Copyright (c) 2026 Vinicius R. Petrarchin — MIT License
 *
 * APNs Live Activity payloads (100% push flow).
 * attributes-type MUST match the Swift struct `OrderAttributes`.
 */

export type OrderContentState = {
  status: 'preparing' | 'on_the_way' | 'delivered' | string;
  title: string;
  subtitle: string;
  progress: number;
};

export type LiveActivityApnsHeaders = {
  'apns-push-type': 'liveactivity';
  'apns-topic': string;
  'apns-priority'?: '5' | '10';
};

export function liveActivityTopic(bundleId: string): string {
  return `${bundleId}.push-type.liveactivity`;
}

export function buildLiveActivityHeaders(
  bundleId: string,
  priority: '5' | '10' = '10',
): LiveActivityApnsHeaders {
  return {
    'apns-push-type': 'liveactivity',
    'apns-topic': liveActivityTopic(bundleId),
    'apns-priority': priority,
  };
}

export function buildStartPayload(params: {
  orderId: string;
  contentState: OrderContentState;
  alertTitle?: string;
  alertBody?: string;
  timestamp?: number;
}) {
  const timestamp = params.timestamp ?? Math.floor(Date.now() / 1000);
  return {
    aps: {
      timestamp,
      event: 'start' as const,
      'attributes-type': 'OrderAttributes',
      attributes: { orderId: params.orderId },
      'content-state': params.contentState,
      alert: {
        title: params.alertTitle ?? 'Order confirmed',
        body: params.alertBody ?? 'Track on Dynamic Island',
      },
    },
  };
}

export function buildUpdatePayload(params: {
  contentState: OrderContentState;
  timestamp?: number;
}) {
  const timestamp = params.timestamp ?? Math.floor(Date.now() / 1000);
  return {
    aps: {
      timestamp,
      event: 'update' as const,
      'content-state': params.contentState,
    },
  };
}

export function buildEndPayload(params: {
  contentState: OrderContentState;
  timestamp?: number;
  dismissalDate?: number;
}) {
  const timestamp = params.timestamp ?? Math.floor(Date.now() / 1000);
  return {
    aps: {
      timestamp,
      event: 'end' as const,
      ...(params.dismissalDate != null
        ? { 'dismissal-date': params.dismissalDate }
        : {}),
      'content-state': params.contentState,
    },
  };
}

/**
 * Envelope FCM HTTP v1 para Live Activity.
 * @see https://firebase.google.com/docs/cloud-messaging/customize-messages/live-activity
 *
 * - `token` = device FCM registration token
 * - `apns.live_activity_token` = pushToStart (start) or pushToUpdate (update/end)
 */
export function buildFcmLiveActivityMessage(params: {
  fcmToken: string;
  liveActivityToken: string;
  apsPayload: { aps: Record<string, unknown> };
  priority?: '5' | '10';
}) {
  return {
    message: {
      token: params.fcmToken,
      apns: {
        live_activity_token: params.liveActivityToken,
        headers: {
          'apns-priority': params.priority ?? '10',
        },
        payload: params.apsPayload,
      },
    },
  };
}

export function fcmSendUrl(projectId: string): string {
  return `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
}

/** Live Activity tokens ≠ FCM/APNs device token. */
export function assertLiveActivityToken(token: string, label: string): void {
  if (!token || typeof token !== 'string') {
    throw new Error(`${label} missing`);
  }
  if (!/^[0-9a-f]+$/i.test(token)) {
    throw new Error(`${label} must be hex (ActivityKit), not FCM JWT`);
  }
  if (token.includes(':')) {
    throw new Error(`${label} looks like FCM — use pushToStart/update token`);
  }
}
