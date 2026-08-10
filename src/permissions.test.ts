import { describe, expect, it } from 'vitest';

import { IOS_AUTH_PROVISIONAL, isPushPermissionEnabled } from './permissions';

describe('isPushPermissionEnabled', () => {
  it('accepts granted', () => {
    expect(isPushPermissionEnabled({ granted: true })).toBe(true);
  });

  it('accepts provisional on iOS', () => {
    expect(
      isPushPermissionEnabled({
        granted: false,
        ios: { status: IOS_AUTH_PROVISIONAL },
      }),
    ).toBe(true);
  });

  it('denies undetermined/denied', () => {
    expect(isPushPermissionEnabled({ granted: false })).toBe(false);
    expect(
      isPushPermissionEnabled({
        granted: false,
        ios: { status: 0 },
      }),
    ).toBe(false);
  });
});
