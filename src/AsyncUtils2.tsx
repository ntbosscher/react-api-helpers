import { addDevelopmentDelay, LoadingEl, NoResultEl } from './AsyncUtils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrResponse } from './Fetcher';

type CallbackWithInput2<T, I> = (input: I) => Promise<T | ErrResponse>;

export type AsyncResult2<T> = {
  LoadingElement: JSX.Element | null;
  NoResultElement: JSX.Element | null;
  LoadingOrErrorElement: JSX.Element | null;
  loadingOrError: boolean;
  loading: boolean;
  error: string | null;
  result: T | null;
  asList: T;
  reload: () => void;
};

export function useAsync2<T, I>(fx: CallbackWithInput2<T, I>, search: I, searchDeps?: any[]): AsyncResult2<T> {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_, setLoadId] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cb = useMemo(() => fx, []);

  const memoizedSearch = useMemo(() => search, searchDeps || [search]);

  const reload = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      let thisLoadId = 0;
      setLoadId((old) => {
        thisLoadId = (old + 1) % 1000;
        return thisLoadId;
      });

      const result = await addDevelopmentDelay(cb(memoizedSearch));

      let isActiveRequest = true;
      setLoadId((old) => {
        isActiveRequest = old === thisLoadId;
        return old;
      });

      if (!isActiveRequest) return;

      if (result && typeof result === 'object' && 'error' in result) throw new Error(result.error);
      setValue(result);
    } catch (e: any) {
      setError(e.toString());
    }

    setLoading(false);
  }, [cb, memoizedSearch]);

  useEffect(() => {
    reload();
  }, [reload]);

  const LoadingElement = LoadingEl(loading, error, reload);
  const NoResultElement = NoResultEl(LoadingElement, value);

  return {
    LoadingElement,
    NoResultElement,
    LoadingOrErrorElement: LoadingElement,
    loadingOrError: loading || error !== null,
    loading,
    error,
    result: value,
    asList: (value as T) || (defaultArray as any as T),
    reload,
  };
}

const defaultArray = [];
