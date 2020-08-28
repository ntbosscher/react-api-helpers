import { ErrResponse } from './Fetcher';
import React, { useCallback, useEffect, useState } from 'react';
import { Loading } from './Loading';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { useAuthenticated } from './Auth';

export function useAsync<T>(
  fx: () => Promise<T | ErrResponse>,
  options?: { withoutAuth: boolean },
): {
  loadingOrError: boolean;
  loading: boolean;
  error: string | null;
  result: T | null;
  reload: () => void;
  LoadingElement: JSX.Element | null;
  LoadingOrErrorElement: JSX.Element | null;
} {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInit, setIsInit] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setIsInit(true);
      const result = await fx();
      if (typeof result === 'object' && 'error' in result) throw new Error(result.error);
      setValue(result);
    } catch (e) {
      setError(e.toString());
    }

    setLoading(false);
  }, [fx]);

  const reload = useCallback(load, [fx]);
  const status = useAuthenticated();

  useEffect(() => {
    if (isInit) return;
    if (!options?.withoutAuth) {
      if (!status.authenticated) {
        setError('Not authenticated');
        return;
      }
    }

    load();
  }, [isInit, status, load, options]);

  const LoadingElement = LoadingEl(loading, error, reload);

  return {
    LoadingElement,
    LoadingOrErrorElement: LoadingElement,
    loadingOrError: loading || error !== null,
    loading,
    error,
    result: value,
    reload,
  };
}

function LoadingEl(loading: boolean, error: string | null, reload?: () => void) {
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Grid container alignItems="center" spacing={1}>
        <Grid item>
          <Typography color="error">{error}</Typography>
        </Grid>
        {reload && (
          <Grid item>
            <Button onClick={() => reload()}>Retry</Button>
          </Grid>
        )}
      </Grid>
    );
  }

  return null;
}

export interface AsyncAction<T, U> {
  loading: boolean;
  error: string | null;
  callback(input: U): void;
  result: T | null;
  LoadingElement: JSX.Element | null;
}

export function useAsyncAction<T, U = any>(callback: (arg: U) => Promise<T>, dependsOn: any[]): AsyncAction<T, U> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const depends = [...dependsOn, callback];

  const theCallback = useCallback(async (arg) => {
    try {
      setError(null);
      setLoading(true);

      const actionResult = await callback(arg);
      if (actionResult && typeof actionResult === 'object' && 'error' in actionResult) {
        throw new Error((actionResult as any).error);
      }

      setLoading(false);
      setResult(actionResult);
    } catch (e) {
      setError(e.toString());
      setLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, depends);

  const LoadingElement = LoadingEl(loading, error);

  return { LoadingElement, loading, error, callback: theCallback, result };
}
