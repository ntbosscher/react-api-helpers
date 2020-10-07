import { PropsWithChildren } from 'react';
import { usePaginatedQuery } from 'react-query';
import { LoadingEl } from './AsyncUtils';
import {
  PaginatedQueryConfig,
  PaginatedQueryResult,
  QueryKey,
  TypedQueryFunction,
  TypedQueryFunctionArgs,
} from 'react-query/types/core/types';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import React from 'react';

const queryCache = new QueryCache();

export function AsyncCacheProvider(props: PropsWithChildren<{}>) {
  return <ReactQueryCacheProvider queryCache={queryCache}>{props.children}</ReactQueryCacheProvider>;
}

export function useAsyncPaginated<TResult, TError extends Error, TArgs extends TypedQueryFunctionArgs>(
  queryKey: QueryKey,
  queryFn: TypedQueryFunction<TResult, TArgs>,
  queryConfig?: PaginatedQueryConfig<TResult, TError>,
): PaginatedQueryResult<TResult, TError> & {
  autoShow: (dataView: JSX.Element) => JSX.Element;
  LoadingOrError: JSX.Element | null;
} {
  const result = usePaginatedQuery(queryKey, queryFn, queryConfig);
  const loading =
    result.isError || result.isLoading
      ? LoadingEl(result.isLoading, result.error?.message as string, () => result.refetch())
      : null;

  return {
    ...result,
    autoShow: loading === null ? (value: JSX.Element) => value : (dataView: JSX.Element) => loading,
    LoadingOrError: loading,
  };
}
