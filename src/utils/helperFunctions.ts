/**
 * Helper Functions - add implementations as needed.
 *
 * Each block below describes the intended helper function, its parameters,
 * return value, example usage, and complexity notes. Keep implementations
 * small, well-tested, and documented.
 */

/**
 * formatDate
 * - Purpose: Format a Date to a localized string or custom format.
 * - Params:
 *   - date: Date | string | number
 *   - options?: { locale?: string; timeZone?: string; options?: Intl.DateTimeFormatOptions }
 * - Returns: formatted string
 * - Example: formatDate(new Date(), { locale: 'en-US' })
 * - Complexity: O(1)
 */

import type { DiscountResult } from '#/types/products/product.types';
import type { Paginated } from '#/types/services.types';
export function getNextPageParamHelper<TData>(lastPage: TData, allPages: TData[], limit: number): number | undefined {
  if (Array.isArray(lastPage)) {
    return lastPage.length === limit ? allPages.length + 1 : undefined;
  }

  if (lastPage && typeof lastPage === 'object') {
    const pageObj = lastPage as Paginated;
    const data = pageObj.data ?? pageObj.items ?? pageObj.results;

    const hasNext =
      pageObj.hasNext !== undefined
        ? pageObj.hasNext
        : pageObj.total !== undefined
          ? allPages.length * limit < pageObj.total
          : Array.isArray(data) && data.length === limit;

    return hasNext ? allPages.length + 1 : undefined;
  }

  return undefined;
}

export const calculateDiscount = (price: number, discountPercentage: number): DiscountResult => {
  const discount = price * (discountPercentage / 100);
  const saving = price - discountPercentage;

  return {
    saving: Number(saving.toFixed(2)),
    discount: Number(discount.toFixed(2)),
  };
};
