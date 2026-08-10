// PedidoVivo — Live Activities via APNs
// Copyright (c) 2026 Vinicius R. Petrarchin — MIT License

import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { registerRootComponent } from 'expo';

import App from './App';

const messaging = getMessaging();

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('[PedidoVivo][Push] background message:', JSON.stringify(remoteMessage));
});

registerRootComponent(App);
