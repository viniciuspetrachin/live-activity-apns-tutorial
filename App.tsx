// PedidoVivo — Live Activities via APNs
// Copyright (c) 2026 Vinicius R. Petrarchin — MIT License

import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ActiveActivity,
  addPushToStartTokenListener,
  addPushToUpdateTokenListener,
  areActivitiesEnabled,
  getActiveActivities,
  getPushToStartToken,
  startObservingTokens,
} from './modules/live-activities/src';
import { registerPushToStartToken, registerUpdateToken } from './src/api';
import { API_BASE_URL } from './src/config';
import { setupPushAndLogTokens, subscribeFcmTokenRefresh } from './src/push';

function shortToken(token: string | null): string {
  if (!token) return '—';
  if (token.length <= 24) return token;
  return `${token.slice(0, 12)}…${token.slice(-8)}`;
}

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [apnsToken, setApnsToken] = useState<string | null>(null);
  const [pushToStartToken, setPushToStartToken] = useState<string | null>(null);
  const [updateToken, setUpdateToken] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActiveActivity[]>([]);
  const [log, setLog] = useState<string>('Waiting for tokens…');
  const [busy, setBusy] = useState(false);

  const refreshActivities = useCallback(() => {
    setActivities(getActiveActivities());
  }, []);

  useEffect(() => {
    setEnabled(areActivitiesEnabled());
    startObservingTokens();
    setPushToStartToken(getPushToStartToken());
    refreshActivities();

    void (async () => {
      const tokens = await setupPushAndLogTokens();
      setFcmToken(tokens.fcmToken);
      setApnsToken(tokens.apnsToken);
      setLog('FCM/APNs logged to Metro console');
    })();

    const unsubFcm = subscribeFcmTokenRefresh((token) => {
      setFcmToken(token);
    });

    const startSub = addPushToStartTokenListener(({ pushToStartToken: token }) => {
      setPushToStartToken(token);
      console.log('[PedidoVivo][LiveActivity] pushToStartToken:', token);
      setLog('pushToStartToken updated (see console)');
    });

    const updateSub = addPushToUpdateTokenListener((event) => {
      setUpdateToken(event.pushToUpdateToken);
      setOrderId(event.orderId);
      setActivityId(event.activityId);
      console.log('[PedidoVivo][LiveActivity] pushToUpdateToken:', event);
      setLog(`update token for order ${event.orderId}`);
      refreshActivities();
    });

    return () => {
      unsubFcm();
      startSub.remove();
      updateSub.remove();
    };
  }, [refreshActivities]);

  const onRegisterStart = async () => {
    if (!pushToStartToken) {
      setLog('No pushToStartToken yet (iOS 17.2+ / Live Activities on)');
      return;
    }
    setBusy(true);
    try {
      await registerPushToStartToken(pushToStartToken);
      setLog(`Registered push-to-start at ${API_BASE_URL}`);
    } catch (e) {
      setLog(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onRegisterUpdate = async () => {
    if (!updateToken || !orderId || !activityId) {
      setLog('No update token — send a start APNs (Postman) first');
      return;
    }
    setBusy(true);
    try {
      await registerUpdateToken({ orderId, activityId, pushToUpdateToken: updateToken });
      setLog(`Registered update token (order ${orderId})`);
    } catch (e) {
      setLog(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onLogTokensAgain = async () => {
    setBusy(true);
    try {
      const tokens = await setupPushAndLogTokens();
      setFcmToken(tokens.fcmToken);
      setApnsToken(tokens.apnsToken);
      console.log('[PedidoVivo][LiveActivity] pushToStartToken:', pushToStartToken);
      console.log('[PedidoVivo][LiveActivity] pushToUpdateToken:', updateToken);
      setLog('Tokens re-logged to console');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>PedidoVivo</Text>
      <Text style={styles.subtitle}>
        Live Activity via APNs + FCM (console token log for Postman).
      </Text>

      <Text style={styles.section}>Push (Firebase / device)</Text>
      <View style={styles.card}>
        <Row label="FCM token" value={shortToken(fcmToken)} />
        <Row label="APNs token" value={shortToken(apnsToken)} />
      </View>

      <Text style={styles.section}>Live Activity (ActivityKit)</Text>
      <View style={styles.card}>
        <Row label="Live Activities" value={enabled ? 'enabled' : 'disabled'} />
        <Row label="pushToStart" value={shortToken(pushToStartToken)} />
        <Row label="updateToken" value={shortToken(updateToken)} />
        <Row label="orderId" value={orderId ?? '—'} />
        <Row label="activityId" value={activityId ? shortToken(activityId) : '—'} />
      </View>

      <Pressable style={styles.button} disabled={busy} onPress={onLogTokensAgain}>
        <Text style={styles.buttonText}>Re-log tokens to console</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.buttonSecondary, (!pushToStartToken || busy) && styles.buttonDisabled]}
        disabled={!pushToStartToken || busy}
        onPress={onRegisterStart}
      >
        <Text style={styles.buttonText}>POST push-to-start (optional)</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.buttonSecondary, (!updateToken || busy) && styles.buttonDisabled]}
        disabled={!updateToken || busy}
        onPress={onRegisterUpdate}
      >
        <Text style={styles.buttonText}>POST update token (optional)</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.buttonGhost]} onPress={refreshActivities}>
        <Text style={styles.buttonGhostText}>Refresh activity list</Text>
      </Pressable>

      {busy ? <ActivityIndicator style={{ marginTop: 8 }} /> : null}

      <Text style={styles.section}>Active activities (read-only)</Text>
      {activities.length === 0 ? (
        <Text style={styles.muted}>None — start APNs via Postman with pushToStartToken</Text>
      ) : (
        activities.map((a) => (
          <View key={a.activityId} style={styles.card}>
            <Row label="order" value={a.orderId} />
            <Row label="status" value={a.status} />
            <Row label="title" value={a.title} />
            <Row label="progress" value={String(a.progress)} />
          </View>
        ))
      )}

      <Text style={styles.section}>Log</Text>
      <Text style={styles.log}>{log}</Text>

      <Text style={styles.hint}>
        In Metro: look for [PedidoVivo][Push] and [PedidoVivo][LiveActivity].{'\n'}
        Normal push (FCM/APNs device) ≠ Live Activity (pushToStart / update).{'\n'}
        For Dynamic Island: use pushToStartToken in Postman with apns-push-type: liveactivity.
      </Text>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 20,
    backgroundColor: '#F7F8FA',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0B1F2A',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: '#3D4F5C',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8DEE4',
  },
  row: {
    gap: 2,
  },
  rowLabel: {
    fontSize: 12,
    color: '#6B7C88',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  rowValue: {
    fontSize: 14,
    color: '#0B1F2A',
    fontVariant: ['tabular-nums'],
  },
  button: {
    backgroundColor: '#0A7EA4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#1F6F4A',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0A7EA4',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonGhostText: {
    color: '#0A7EA4',
    fontWeight: '600',
    fontSize: 15,
  },
  section: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#0B1F2A',
  },
  muted: {
    color: '#6B7C88',
  },
  log: {
    fontSize: 13,
    color: '#1A2B36',
    backgroundColor: '#E8EEF2',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7C88',
  },
});
