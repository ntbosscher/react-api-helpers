import * as React from 'react';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { notAuthorizedResponse } from './APIBase';

interface Auth {
  authenticated: boolean;
  lastPingResult: any | null;
  setAuthenticated(tf: boolean): void;
}

const AuthContext = createContext<Auth>({
  authenticated: false,
  lastPingResult: null,
  setAuthenticated(tf: boolean) {
    console.error('auth context not configured');
  },
});

export function AuthProvider(
  props: PropsWithChildren<{
    onPing?: () => Promise<any>;
    pingInterval?: number; // default: every 30 sec
  }>,
) {
  const [authenticated, setAuthenticated] = useState(true);
  const [lastPingResult, setLastPingResult] = useState(null);

  let { onPing, pingInterval } = props;

  useEffect(() => {
    if (!onPing) return;
    const ping = onPing;
    const checker = setInterval(async () => setLastPingResult(await ping()), pingInterval || 30 * 1000);
    return () => clearInterval(checker);
  }, [onPing, pingInterval]);

  useEffect(() => {
    const sub = notAuthorizedResponse.subscribe(() => {
      setAuthenticated(false);
    });

    return () => sub.cancel();
  }, []);

  const ctx = useMemo(() => ({ authenticated, setAuthenticated, lastPingResult }), [
    authenticated,
    setAuthenticated,
    lastPingResult,
  ]);

  return <AuthContext.Provider value={ctx}>{props.children}</AuthContext.Provider>;
}

export function useAuthenticated() {
  return useContext(AuthContext);
}
