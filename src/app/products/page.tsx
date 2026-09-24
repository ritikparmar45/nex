'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useProductContext } from '@/context/ProductContext';
import { useProductParams } from '@/hooks/useProductParams';
import { useDebounce } from '@/hooks/useDebounce';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCards } from '@/components/products/ProductCards';
import { Pagination } from '@/components/products/Pagination';
import { DeleteModal } from '@/components/products/DeleteModal';
import { TableSkeleton, CardSkeleton } from '@/components/common/Skeleton';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { EmptyState } from '@/components/common/EmptyState';

function ProductsDashboardContent() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { applyLocalMutations, deleteLocalProduct } = useProductContext();
  const router = useRouter();

  // URL search params hook
  const { params, updateParams, clearFilters } = useProductParams();

  // Local state for instant input feeling before debounced API request
  const [searchInput, setSearchInput] = useState<string>(params.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Data loading & error states
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /**
   * RACE CONDITION PROTECTION & REQUEST CANCELLATION
   * ------------------------------------------------
   * Holds the active AbortController for outgoing HTTP request.
   * If a user types fast or changes filters quickly, `abortControllerRef.current.abort()`
   * cancels the pending request so stale responses CANNOT overwrite newer data.
   */
  const abortControllerRef = useRef<AbortController | null>(null);

  // Protect route against unauthenticated users
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Keep local searchInput synced when URL `search` param changes externally
  useEffect(() => {
    setSearchInput(params.search);
  }, [params.search]);

  // Sync debounced search query into URL params (resetting page to 1)
  useEffect(() => {
    if (debouncedSearch !== params.search) {
      updateParams({ search: debouncedSearch }, true);
    }
  }, [debouncedSearch, params.search, updateParams]);

  /**
   * Fetch Products Core Function
   * ----------------------------
   * Reads current URL parameters (page, limit, search, category, sort)
   * and executes the appropriate API call with race-condition cancellation.
   */
  const fetchProducts = useCallback(async () => {
    // Cancel any previous pending request before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setIsSearching(!!params.search);
    setError(null);

    const { page, limit, search, category, sort } = params;
    const skip = (page - 1) * limit;

    // Parse sort field and direction (e.g. 'price-asc' -> sortBy='price', order='asc')
    let sortBy: string | undefined;
    let order: 'asc' | 'desc' | undefined;
    if (sort) {
      const parts = sort.split('-');
      sortBy = parts[0];
      order = parts[1] as 'asc' | 'desc';
    }

    try {
      let response;

      // DummyJSON API behavior handling:
      if (search) {
        // Search endpoint takes priority when query is present
        response = await productService.searchProducts(
          search,
          { limit, skip, sortBy, order },
          controller.signal
        );

        // If category is also selected, filter search results locally by category
        if (category && response.products) {
          response.products = response.products.filter(
            (p) => p.category.toLowerCase() === category.toLowerCase()
          );
          response.total = response.products.length;
        }
      } else if (category) {
        // Category endpoint when category selected without search
        response = await productService.getProductsByCategory(
          category,
          { limit, skip, sortBy, order },
          controller.signal
        );
      } else {
        // Standard paginated list endpoint
        response = await productService.getProducts(
          { limit, skip, sortBy, order },
          controller.signal
        );
      }

      // Merge server response with session-persisted local mutations (Add/Edit/Delete)
      const merged = applyLocalMutations(
        response.products || [],
        response.total || 0
      );

      setProducts(merged.products);
      setTotalProducts(merged.total);
    } catch (err: any) {
      // Ignore AbortError / cancelled requests completely so no error state is displayed
      if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      setError(
        err.message || 'Something went wrong while loading products. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [params, applyLocalMutations]);

  // Execute fetch when URL parameters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }

    // Cleanup phase: cancel request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts, isAuthenticated]);

  // Filter change handlers
  const handleCategoryChange = (newCategory: string) => {
    updateParams({ category: newCategory }, true);
  };

  const handleSortChange = (newSort: string) => {
    updateParams({ sort: newSort });
  };

  const handleLimitChange = (newLimit: number) => {
    updateParams({ limit: newLimit }, true);
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  // Delete product action handler
  const handleDeleteConfirm = async () => {
    if (!productToDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      // Call DummyJSON DELETE endpoint (simulated)
      await productService.deleteProduct(productToDelete.id);

      // Persist deletion in session ProductContext state
      deleteLocalProduct(productToDelete.id);

      // Update local view state immediately
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setTotalProducts((prev) => Math.max(0, prev - 1));

      setProductToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const totalPages = Math.ceil(totalProducts / params.limit) || 1;

  return (
    <div className="space-y-6">
      {/* Dashboard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage product inventory, search catalog, filter categories, and maintain product records.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ProductFilters
        search={searchInput}
        category={params.category}
        sort={params.sort}
        limit={params.limit}
        isSearching={isSearching}
        onSearchChange={setSearchInput}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onLimitChange={handleLimitChange}
        onClearFilters={() => {
          setSearchInput('');
          clearFilters();
        }}
      />

      {/* Error View */}
      {error ? (
        <ErrorAlert message={error} onRetry={fetchProducts} />
      ) : isLoading ? (
        // Loading Skeleton
        <div>
          <div className="hidden md:block">
            <TableSkeleton rows={params.limit > 10 ? 8 : params.limit} />
          </div>
          <div className="md:hidden">
            <CardSkeleton count={6} />
          </div>
        </div>
      ) : products.length === 0 ? (
        // Empty Search/Filter State
        <EmptyState
          onClearFilters={() => {
            setSearchInput('');
            clearFilters();
          }}
        />
      ) : (
        // Products List View (Desktop Table + Mobile Cards)
        <div>
          <ProductTable
            products={products}
            onDeleteClick={(p) => setProductToDelete(p)}
          />
          <ProductCards
            products={products}
            onDeleteClick={(p) => setProductToDelete(p)}
          />

          {/* Pagination Controls */}
          <Pagination
            currentPage={params.page}
            totalPages={totalPages}
            totalItems={totalProducts}
            limit={params.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!productToDelete}
        product={productToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

export default function ProductsDashboardPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} />}>
      <ProductsDashboardContent />
    </Suspense>
  );
}
