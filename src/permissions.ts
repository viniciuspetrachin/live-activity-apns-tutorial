/**
 * Interprets the `expo-notifications` response (replaces RNFB AuthorizationStatus).
 * Granted + iOS provisional count as enabled.
 *
 * `IosAuthorizationStatus.PROVISIONAL === 3` (expo-notifications).
 * We keep the number here so the helper is testable without loading the Expo runtime.
 */
export const IOS_AUTH_PROVISIONAL = 3;

export type PushPermissionSnapshot = {
  granted: boolean;
  ios?: { status?: number } | null;
};

export function isPushPermissionEnabled(settings: PushPermissionSnapshot): boolean {
  if (settings.granted) return true;
  return settings.ios?.status === IOS_AUTH_PROVISIONAL;
}
