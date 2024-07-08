import { PropsWithChildren } from 'react';
import { usePaginatedQuery } from 'react-query';
import { addDevelopmentDelay, LoadingEl, NoResultEl } from './AsyncUtils';
import {
  PaginatedQueryConfig,
  PaginatedQueryResult,
  QueryKey,
  TypedQueryFunction,
  TypedQueryFunctionArgs,
} from 'react-query/types/core/types';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ErrResponse } from './Fetcher';

const queryCache = new QueryCache();

export function AsyncCacheProvider(props: PropsWithChildren<{}>) {
  return <ReactQueryCacheProvider queryCache={queryCache}>{props.children}</ReactQueryCacheProvider>;
}

export function useAsyncPaginated<
  TResult extends Array<any>,
  TError extends Error,
  TArgs extends TypedQueryFunctionArgs
>(
  queryKey: QueryKey,
  queryFn: TypedQueryFunction<TResult, TArgs>,
  queryConfig?: PaginatedQueryConfig<TResult, TError>,
): PaginatedQueryResult<TResult, TError> & {
  autoShow: (dataView: JSX.Element, noDataView?: JSX.Element) => JSX.Element;
  list: TResult;
  LoadingOrError: JSX.Element | null;
} {
  const result = usePaginatedQuery(queryKey, queryFn, queryConfig);
  const loading =
    result.isError || result.isLoading
      ? LoadingEl(result.isLoading, result.error?.message as string, () => result.refetch())
      : null;

  const list = result.resolvedData || ([] as any);

  const renderer = (value: JSX.Element, noDataView?: JSX.Element) => {
    if (noDataView && list instanceof Array && list.length === 0) return noDataView;
    return value;
  };

  return {
    ...result,
    list: list,
    autoShow: loading === null ? renderer : (dataView: JSX.Element) => loading,
    LoadingOrError: loading,
  };
}

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
    } catch (e) {
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
    asList: listValue as any,
    reload,
  };
}

const defaultArray = [];
