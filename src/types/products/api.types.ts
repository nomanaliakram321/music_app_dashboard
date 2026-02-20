import type { Category } from './category.types';

export type CategoriesResponse = Category[];

export type GetProductsCategoryParams = {
  q?: string;
  category?: string;
};
export type GetProductsParams = {
  q?: string;
  limit?: number;
  skip?: number;
};
