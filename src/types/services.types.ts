import type { UseInfiniteQueryOptions } from '@tanstack/react-query';

/**
 * Configuration object for the `useInfiniteScrollQuery` hook.
 *
 * Defines the parameters required to set up an infinite query
 * using React Query, including API endpoint details, pagination,
 * and optional query behaviors.
 *
 * @template TParams - The type of query parameters (defaults to `Record<string, unknown>`).
 * @template TData - The type of data returned by the API (defaults to `unknown`).
 */
export interface InfiniteQueryConfig<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TData = unknown,
> {
  /** Unique key used by React Query for caching the query result. */
  key: string;

  /** API endpoint URL to fetch data from. */
  url: string;

  /** Optional query parameters to include in the request. */
  params?: TParams;

  /** Number of items to fetch per page (defaults to 10). */
  limit?: number;

  /**
   * Optional custom function to determine the next page parameter.
   * If not provided, the hook will attempt to infer pagination
   * from the API response.
   */
  getNextPageParam?: (lastPage: TData, allPages: TData[]) => unknown;

  /**
   * Additional React Query options, excluding:
   * - `queryKey` (auto-generated internally)
   * - `queryFn` (handled internally)
   * - `getNextPageParam` (may be overridden)
   */
  options?: Omit<
    UseInfiniteQueryOptions<TData, unknown, TData, TData, [string, string, number]>,
    'queryKey' | 'queryFn' | 'getNextPageParam'
  >;
}

export type Paginated = {
  data?: unknown[];
  items?: unknown[];
  results?: unknown[];
  hasNext?: boolean;
  total?: number;
};
