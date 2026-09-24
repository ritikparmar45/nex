import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface ParsedProductParams {
  page: number;
  limit: number;
  search: string;
  category: string;
  sort: string;
}

const SUPPORTED_LIMITS = [10, 20, 50];
const DEFAULT_LIMIT = 20;

/**
 * useProductParams Hook
 * ---------------------
 * Synchronizes dashboard search, category, sort, page, and limit state with URL search parameters.
 * Automatically normalizes invalid URL parameters to prevent crashes or unexpected API calls.
 */
export function useProductParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Safely parse and normalize query parameters from current URL
  const params: ParsedProductParams = useMemo(() => {
    // Normalize page parameter
    const rawPage = searchParams.get('page');
    let page = 1;
    if (rawPage) {
      const parsed = parseInt(rawPage, 10);
      if (!isNaN(parsed) && parsed > 0) {
        page = parsed;
      }
    }

    // Normalize limit parameter
    const rawLimit = searchParams.get('limit');
    let limit = DEFAULT_LIMIT;
    if (rawLimit) {
      const parsed = parseInt(rawLimit, 10);
      if (!isNaN(parsed) && SUPPORTED_LIMITS.includes(parsed)) {
        limit = parsed;
      }
    }

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || '';

    return { page, limit, search, category, sort };
  }, [searchParams]);

  /**
   * Updates URL search parameters smoothly without full page reloads.
   * If `resetPage` is true, resets page to 1 (e.g. when searching or changing category).
   */
  const updateParams = useCallback(
    (newParams: Partial<ParsedProductParams>, resetPage: boolean = false) => {
      const urlSearchParams = new URLSearchParams(searchParams.toString());

      // If resetting page (search or category change), force page=1 unless page is explicitly passed
      if (resetPage && !('page' in newParams)) {
        urlSearchParams.set('page', '1');
      }

      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Default values can optionally be omitted from URL for cleaner links
          urlSearchParams.set(key, String(value));
        } else {
          urlSearchParams.delete(key);
        }
      });

      const queryString = urlSearchParams.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  /**
   * Resets all filters back to default empty state
   */
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    params,
    updateParams,
    clearFilters,
  };
}
