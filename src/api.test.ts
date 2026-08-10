import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  API_PATHS,
  pushToStartBody,
  registerPushToStartToken,
  registerUpdateToken,
  updateTokenBody,
} from './api';

describe('API client (LA token registration)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('paths and bodies match the server contract', () => {
    expect(API_PATHS.pushToStart).toBe('/devices/push-to-start');
    expect(API_PATHS.updateToken('ord/1')).toBe('/activities/ord%2F1/update-token');
    expect(pushToStartBody('aa')).toEqual({ pushToStartToken: 'aa' });
    expect(
      updateTokenBody({
        orderId: 'ord_1',
        activityId: 'act_1',
        pushToUpdateToken: 'bb',
      }),
    ).toEqual({
      orderId: 'ord_1',
      activityId: 'act_1',
      pushToUpdateToken: 'bb',
    });
  });

  it('registerPushToStartToken POST JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'ok',
    });
    vi.stubGlobal('fetch', fetchMock);

    await registerPushToStartToken('abc123');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/devices/push-to-start');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ pushToStartToken: 'abc123' });
  });

  it('registerUpdateToken POST to orderId path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });
    vi.stubGlobal('fetch', fetchMock);

    await registerUpdateToken({
      orderId: 'ord_9',
      activityId: 'act_9',
      pushToUpdateToken: 'ff00',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/activities/ord_9/update-token');
    expect(JSON.parse(String(init.body))).toMatchObject({
      pushToUpdateToken: 'ff00',
      activityId: 'act_9',
    });
  });

  it('propagates HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'err',
        text: async () => 'boom',
      }),
    );

    await expect(registerPushToStartToken('x')).rejects.toThrow(/500/);
  });
});
