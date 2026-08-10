import Constants from 'expo-constants';

/** Local server/ base URL (use your machine IP on a physical device). */
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  'http://localhost:8787';
