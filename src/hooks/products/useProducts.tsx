import { useState, useMemo } from 'react';

import { useGetCategories } from '#/data/home/queries/getCategories';
import { useGetProducts } from '#/data/home/queries/getProducts';

interface UseProductsParams {
  searchQuery?: string;
}

export const useProducts = ({ searchQuery = '' }: UseProductsParams = {}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const queryParams = searchQuery.trim() ? { q: searchQuery } : { category: selectedCategory };

  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetProducts(queryParams);
  const { data: categories = [], isPending: categoriesLoading } = useGetCategories();

  const isLoading = productsLoading || categoriesLoading;

  const products = useMemo(() => {
    return productsData?.pages.flatMap(page => page.products) ?? [];
  }, [productsData?.pages]);

  const totalProducts = productsData?.pages[0]?.total ?? 0;

  return {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    totalProducts,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
};
