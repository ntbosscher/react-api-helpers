import * as React from 'react';
import { createContext, useCallback, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { notAuthorizedResponse } from './APIBase';

interface Auth {
  authenticated: boolean;
  lastPingResult: any | null;
  setAuthenticated(tf: boolean): void;
  forcePing(): void;
}

const AuthContext = createContext<Auth>({
  authenticated: false,
  lastPingResult: null,
  forcePing() {
    console.error('auth context not configured');
  },
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

  const check = useCallback(async () => {
    if(!onPing) return;
    setLastPingResult(await onPing())
  }, [onPing]);

  useEffect(() => {
    if (!onPing) return;

    check(); // trigger check now b/c setInterval will wait for the first interval to elapse

    const checker = setInterval(check, pingInterval || 30 * 1000);
    return () => clearInterval(checker);
  }, [onPing, pingInterval, check]);

  useEffect(() => {
    const sub = notAuthorizedResponse.subscribe(() => {
      setAuthenticated(false);
    });

    return () => sub.cancel();
  }, []);

  const ctx = useMemo(() => ({ authenticated, setAuthenticated, lastPingResult, forcePing: check }), [
    authenticated,
    setAuthenticated,
    lastPingResult,
    check,
  ]);

  return <AuthContext.Provider value={ctx}>{props.children}</AuthContext.Provider>;
}

export function useAuthenticated() {
  return useContext(AuthContext);
}
