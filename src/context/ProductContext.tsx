'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, ProductFormData } from '@/types/product';

interface LocalMutationsState {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
}

interface ProductContextType {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
  addLocalProduct: (product: Product) => void;
  updateLocalProduct: (id: number, data: Partial<ProductFormData>) => void;
  deleteLocalProduct: (id: number) => void;
  applyLocalMutations: (
    serverProducts: Product[],
    total: number
  ) => { products: Product[]; total: number };
  getLocalProductOverride: (id: number) => Partial<Product> | null;
  isDeletedLocally: (id: number) => boolean;
}

const STORAGE_KEY = 'dummyjson_local_mutations_v1';

const ProductContext = createContext<ProductContextType | undefined>(undefined);

/**
 * Product Context
 * ---------------
 * Solution for DummyJSON mutation limitation:
 * DummyJSON simulates POST/PUT/DELETE API requests but does not permanently save them on the server.
 * This context maintains session-persisted local mutations (additions, updates, deletions)
 * and seamlessly merges them into server-fetched product responses.
 */
export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [mutations, setMutations] = useState<LocalMutationsState>({
    addedProducts: [],
    updatedProducts: {},
    deletedProductIds: [],
  });

  // Restore mutations from sessionStorage on client load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setMutations(JSON.parse(saved));
        } catch {
          // ignore parsing error
        }
      }
    }
  }, []);

  // Save to sessionStorage when mutations change
  const saveMutations = (newMutations: LocalMutationsState) => {
    setMutations(newMutations);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newMutations));
    }
  };

  const addLocalProduct = (product: Product) => {
    const updated = {
      ...mutations,
      addedProducts: [product, ...mutations.addedProducts],
    };
    saveMutations(updated);
  };

  const updateLocalProduct = (id: number, data: Partial<ProductFormData>) => {
    const existing = mutations.updatedProducts[id] || {};
    const updated = {
      ...mutations,
      updatedProducts: {
        ...mutations.updatedProducts,
        [id]: { ...existing, ...data },
      },
      // If updating a product that was locally added:
      addedProducts: mutations.addedProducts.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    };
    saveMutations(updated);
  };

  const deleteLocalProduct = (id: number) => {
    const updated = {
      ...mutations,
      deletedProductIds: [...mutations.deletedProductIds, id],
      addedProducts: mutations.addedProducts.filter((p) => p.id !== id),
    };
    saveMutations(updated);
  };

  const getLocalProductOverride = (id: number): Partial<Product> | null => {
    // Check locally added first
    const addedMatch = mutations.addedProducts.find((p) => p.id === id);
    if (addedMatch) return addedMatch;

    // Check updated overrides
    if (mutations.updatedProducts[id]) {
      return mutations.updatedProducts[id];
    }
    return null;
  };

  const isDeletedLocally = (id: number): boolean => {
    return mutations.deletedProductIds.includes(id);
  };

  /**
   * Applies session-persisted local mutations to raw server-fetched products
   */
  const applyLocalMutations = (
    serverProducts: Product[],
    total: number
  ) => {
    // 1. Filter out deleted products
    let result = serverProducts.filter(
      (p) => !mutations.deletedProductIds.includes(p.id)
    );

    // 2. Apply updated property overrides
    result = result.map((p) => {
      const overrides = mutations.updatedProducts[p.id];
      if (overrides) {
        return { ...p, ...overrides };
      }
      return p;
    });

    // 3. Prepend newly added local products if not already included
    const missingAdded = mutations.addedProducts.filter(
      (ap) => !result.some((rp) => rp.id === ap.id)
    );

    const finalProducts = [...missingAdded, ...result];
    const finalTotal = total + mutations.addedProducts.length - mutations.deletedProductIds.length;

    return {
      products: finalProducts,
      total: Math.max(0, finalTotal),
    };
  };

  return (
    <ProductContext.Provider
      value={{
        addedProducts: mutations.addedProducts,
        updatedProducts: mutations.updatedProducts,
        deletedProductIds: mutations.deletedProductIds,
        addLocalProduct,
        updateLocalProduct,
        deleteLocalProduct,
        applyLocalMutations,
        getLocalProductOverride,
        isDeletedLocally,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
}
