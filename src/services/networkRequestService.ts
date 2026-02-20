import { useInfiniteQuery } from '@tanstack/react-query';

import { GET } from '#/constants';
import type { InfiniteQueryConfig } from '#/types/services.types';
import { getNextPageParamHelper } from '#/utils';
import { performRequest } from './apiClient';

/**
 * Custom React Query hook for handling infinite scrolling data fetching.
 *
 * This hook abstracts the logic of using `useInfiniteQuery` with a paginated API,
 * automatically handling next page detection and caching.
 *
 * @template TData - The type of data returned by the API.
 * @template TParams - The type of query parameters (defaults to Record<string, unknown>).
 *
 * @param config - Configuration object for the query.
 * @param config.key - Unique key for caching the query.
 * @param config.url - API endpoint URL.
 * @param config.params - Query parameters to be sent with the request.
 * @param config.limit - Number of items per page (default: 10).
 * @param config.getNextPageParam - Optional custom function to determine the next page param.
 * @param config.options - Additional React Query options.
 *
 * @returns A React Query `useInfiniteQuery` result object, which includes data,
 * status, pagination helpers, and fetch functions.
 *
 * @example
 * ```ts
 * const { data, fetchNextPage, hasNextPage } = useInfiniteScrollQuery<User[], { search: string }>({
 *   key: 'users',
 *   url: '/api/users',
 *   params: { search: 'John' },
 *   limit: 20,
 * });
 * ```
 */

const STALE_TIME_FIVE_MINUTES = 5 * 60 * 1000;

export function useInfiniteScrollQuery<TData, TParams extends Record<string, unknown> = Record<string, unknown>>({
  key,
  url,
  params = {} as TParams,
  getNextPageParam,
  options = { initialPageParam: 1 },
}: InfiniteQueryConfig<TParams, TData>) {
  const stableParams = JSON.stringify(params);

  return useInfiniteQuery<TData, unknown, TData, [string, string, number]>({
    queryKey: [key, stableParams, params?.limit as number],
    queryFn: ({ pageParam = 1 }) =>
      performRequest<TData, undefined, TParams & { page: number }>({
        method: GET,
        url,
        params: { ...params, page: pageParam } as TParams & { page: number },
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (getNextPageParam) {
        return getNextPageParam(lastPage, allPages);
      }
      return getNextPageParamHelper(lastPage, allPages, params?.limit as number);
    },
    staleTime: STALE_TIME_FIVE_MINUTES,
    ...options,
  });
}
