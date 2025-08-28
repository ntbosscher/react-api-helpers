import { addDevelopmentDelay, LoadingEl, NoResultEl } from './AsyncUtils';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cb = useMemo(() => fx, []);

  const reqVersionRef = useRef(0);
  const memoizedSearch = useMemo(() => search, searchDeps || [search]);

  const reload = useCallback(async () => {

    if(reqVersionRef.current > 1000) {
      reqVersionRef.current = 1;
    }

    reqVersionRef.current++
    const version = reqVersionRef.current;

    try {
      setError(null);
      setLoading(true);


      const result = await addDevelopmentDelay(cb(memoizedSearch));
      if(reqVersionRef.current !== version) return;

      if (result && typeof result === 'object' && 'error' in result) throw new Error(result.error);
      setValue(result);
    } catch (e: any) {

      if(reqVersionRef.current !== version) return;
      setError(e.toString());
    }

    setLoading(false);
  }, [cb, memoizedSearch]);

  useEffect(() => {
    reload();
  }, [reload]);

  const LoadingElement = LoadingEl(loading, error, reload);
  const NoResultElement = NoResultEl(LoadingElement, value);
  const listValue = !!value && value instanceof Array ? (value as any) : defaultArray;

  return {
    LoadingElement,
    NoResultElement,
    LoadingOrErrorElement: LoadingElement,
    loadingOrError: loading || error !== null,
    loading,
    error,
    result: value,
    asList: listValue,
    reload,
  };
}

const defaultArray = [];
