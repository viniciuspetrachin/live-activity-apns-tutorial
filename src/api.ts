import { API_BASE_URL } from './config';

export const API_PATHS = {
  pushToStart: '/devices/push-to-start',
  updateToken: (orderId: string) =>
    `/activities/${encodeURIComponent(orderId)}/update-token`,
} as const;

export function pushToStartBody(pushToStartToken: string) {
  return { pushToStartToken };
}

export function updateTokenBody(params: {
  orderId: string;
  activityId: string;
  pushToUpdateToken: string;
}) {
  return {
    activityId: params.activityId,
    pushToUpdateToken: params.pushToUpdateToken,
    orderId: params.orderId,
  };
}

async function postJson(path: string, body: unknown): Promise<string> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${text || res.statusText}`);
  }
  return text || 'ok';
}

export function registerPushToStartToken(pushToStartToken: string) {
  return postJson(API_PATHS.pushToStart, pushToStartBody(pushToStartToken));
}

export function registerUpdateToken(params: {
  orderId: string;
  activityId: string;
  pushToUpdateToken: string;
}) {
  return postJson(API_PATHS.updateToken(params.orderId), updateTokenBody(params));
}
