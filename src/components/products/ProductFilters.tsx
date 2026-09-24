'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@/types/product';
import { productService } from '@/services/productService';
import { formatCategoryName, getCategorySlug } from '@/utils/formatters';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  Layers,
  Loader2,
} from 'lucide-react';

interface ProductFiltersProps {
  search: string;
  category: string;
  sort: string;
  limit: number;
  isSearching?: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onLimitChange: (value: number) => void;
  onClearFilters: () => void;
}

const SORT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating: Highest', value: 'rating-desc' },
  { label: 'Title: A to Z', value: 'title-asc' },
  { label: 'Title: Z to A', value: 'title-desc' },
];

const LIMIT_OPTIONS = [10, 20, 50];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  search,
  category,
  sort,
  limit,
  isSearching = false,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onLimitChange,
  onClearFilters,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    productService
      .getCategories()
      .then((res) => {
        if (isMounted) {
          setCategories(res || []);
        }
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const hasActiveFilters = search || category || sort;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Input (lg:col-span-4) */}
        <div className="lg:col-span-4 relative">
          <label htmlFor="search-input" className="sr-only">
            Search products
          </label>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            id="search-input"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by title..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Select (lg:col-span-3) */}
        <div className="lg:col-span-3 relative">
          <label htmlFor="category-select" className="sr-only">
            Filter by category
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            id="category-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={loadingCategories}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => {
              const slug = getCategorySlug(cat);
              const name = formatCategoryName(cat);
              return (
                <option key={idx} value={slug}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Sort Select (lg:col-span-3) */}
        <div className="lg:col-span-3 relative">
          <label htmlFor="sort-select" className="sr-only">
            Sort products
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <ArrowUpDown className="w-4 h-4" />
          </div>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Limit Per Page Select (lg:col-span-2) */}
        <div className="lg:col-span-2 relative flex items-center">
          <label htmlFor="limit-select" className="sr-only">
            Products per page
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Layers className="w-4 h-4" />
          </div>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            {LIMIT_OPTIONS.map((val) => (
              <option key={val} value={val}>
                {val} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Pills & Reset Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 font-medium rounded-md border border-primary-200">
                Search: &quot;{search}&quot;
                <button
                  onClick={() => onSearchChange('')}
                  className="hover:text-primary-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 font-medium rounded-md border border-indigo-200">
                Category: {formatCategoryName(category)}
                <button
                  onClick={() => onCategoryChange('')}
                  className="hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sort && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-medium rounded-md border border-amber-200">
                Sort: {SORT_OPTIONS.find((s) => s.value === sort)?.label}
                <button
                  onClick={() => onSortChange('')}
                  className="hover:text-amber-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={onClearFilters}
            className="text-xs text-slate-500 hover:text-slate-900 font-medium underline underline-offset-2"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
};
