import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { apiEndpoints, queryKeys } from '#/constants';
import { GET } from '#/constants';
import { performRequest } from '#/services/apiClient';
import type { GetProductsCategoryParams } from '#/types/products/api.types';
import type { Product, ProductsResponse } from '#/types/products/product.types';
import { PAGE_LIMIT } from '#/utils';

export const useGetProducts = (params?: GetProductsCategoryParams) => {
  const isSearch = Boolean(params?.q);
  const category = params?.category;
  const hasCategory = Boolean(category && category !== 'all');

  const getUrl = () => {
    if (isSearch) return apiEndpoints.PRODUCTS_SEARCH;
    if (hasCategory) return `${apiEndpoints.PRODUCTS_CATEGORY}/${category}`;
    return apiEndpoints.PRODUCTS;
  };

  return useInfiniteQuery<ProductsResponse, Error>({
    queryKey: [queryKeys.PRODUCTS, params?.q, category],
    queryFn: ({ pageParam = 0 }) =>
      performRequest<ProductsResponse>({
        method: GET,
        url: getUrl(),
        params: {
          ...(isSearch ? { q: params?.q } : {}),
          limit: PAGE_LIMIT,
          skip: pageParam,
        },
      }),
    initialPageParam: 0,
    getNextPageParam: lastPage => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    enabled: isSearch ? !!params?.q : true,
  });
};

export const useGetProductDetail = (id: string) => {
  return useQuery<Product, Error>({
    queryKey: ['product', id],
    queryFn: () =>
      performRequest<Product>({
        method: GET,
        url: `${apiEndpoints.PRODUCTS}/${id}`,
      }),
    enabled: !!id,
  });
};
