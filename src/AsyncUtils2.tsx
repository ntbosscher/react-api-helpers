import { usePaginatedQuery } from 'react-query';
import { LoadingEl } from './AsyncUtils';

type Callback<T> = (page: number) => Promise<T[]>;

export function useAsyncPaginated<T>(
  key: string,
  page: number,
  callback: Callback<T>,
): {
  LoadingOrErrorElement: JSX.Element | null;
  current: T[];
  isPreviousData: boolean;
  clear(): void;
  canFetchMore: boolean;
} {
  const result = usePaginatedQuery([key, page, callback], (key, page: number = 0, callback: Callback<T>) =>
    callback(page),
  );

  return {
    LoadingOrErrorElement:
      result.isError || result.isLoading
        ? LoadingEl(result.isLoading, (result.error as Error | undefined)?.message as string, () => result.refetch())
        : null,
    current: result.resolvedData || [],
    isPreviousData: result.isPreviousData,
    clear: result.clear,
    canFetchMore: result.canFetchMore || false,
  };
}
