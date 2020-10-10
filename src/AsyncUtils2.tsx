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
