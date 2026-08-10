// PedidoVivo — Live Activities via APNs
// Copyright (c) 2026 Vinicius R. Petrarchin — MIT License

import {
  getAPNSToken,
  getMessaging,
  getToken,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { isPushPermissionEnabled } from './permissions';

export type PushTokens = {
  fcmToken: string | null;
  apnsToken: string | null;
};

/**
 * Permission via expo-notifications (recommended API for RNFB v26+).
 * @see https://docs.expo.dev/guides/permissions/
 * @see https://docs.expo.dev/versions/latest/sdk/notifications/
 */
export async function ensurePushPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (isPushPermissionEnabled(existing)) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return isPushPermissionEnabled(requested);
}

/** Poll until the APNs device token appears (common iOS race after permission). */
export async function waitForApnsDeviceToken(
  messaging: ReturnType<typeof getMessaging>,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<string | null> {
  const timeoutMs = options.timeoutMs ?? 2500;
  const intervalMs = options.intervalMs ?? 500;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() <= deadline) {
    const token = await getAPNSToken(messaging);
    if (token) return token;
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return getAPNSToken(messaging);
}

/**
 * Request permission (Expo), read FCM + APNs and log to console (useful for Postman).
 *
 * Note: these are NOT Live Activity tokens.
 * - FCM / APNs device token → normal push (alert/data)
 * - pushToStartToken / pushToUpdateToken → Live Activity (native module)
 */
export async function setupPushAndLogTokens(): Promise<PushTokens> {
  const messaging = getMessaging();
  const enabled = await ensurePushPermission();

  console.log('[PedidoVivo][Push] Permission enabled=', enabled);

  let fcmToken: string | null = null;
  let apnsToken: string | null = null;

  if (enabled) {
    if (Platform.OS === 'ios') {
      apnsToken = await waitForApnsDeviceToken(messaging);
      console.log('[PedidoVivo][Push] APNs token:', apnsToken);
    }

    try {
      fcmToken = await getToken(messaging);
      console.log('[PedidoVivo][Push] FCM token:', fcmToken);
    } catch (e) {
      console.warn('[PedidoVivo][Push] getToken failed:', e);
    }
  }

  return { fcmToken, apnsToken };
}

export function subscribeFcmTokenRefresh(
  onRefresh: (fcmToken: string) => void,
): () => void {
  const messaging = getMessaging();
  return onTokenRefresh(messaging, async (token) => {
    console.log('[PedidoVivo][Push] FCM token refresh:', token);
    onRefresh(token);
    if (Platform.OS === 'ios') {
      const apns = await getAPNSToken(messaging);
      console.log('[PedidoVivo][Push] APNs token (after refresh):', apns);
    }
  });
}
