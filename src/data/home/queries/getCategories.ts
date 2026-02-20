import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { apiEndpoints, queryKeys } from '#/constants';
import { GET } from '#/constants';
import { performRequest } from '#/services/apiClient';
import type { CategoriesResponse } from '#/types/products/api.types';

/**
 * Custom hook to fetch posts using React Query.
 *
 * This hook uses the `performGetRequest` utility to call the `/posts` endpoint
 * and retrieve post data. It accepts optional query parameters and React Query options.
 *
 * This query will typically be used in:
 * `data/home/queries/getPosts.ts` to separate the data layer from components.
 *
 * @example
 * const { data, isLoading, error } = useGetPosts({
 *   params: { limit: 10 },
 *   options: { staleTime: 300000 }
 * });
 */

export const useGetCategories = (options?: UseQueryOptions<CategoriesResponse, Error>) => {
  return useQuery<CategoriesResponse, Error>({
    queryKey: [queryKeys.CATEGORIES],
    queryFn: () =>
      performRequest({
        method: GET,
        url: apiEndpoints.CATEGORIES,
      }),
    ...options,
  });
};
