'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProductContext } from '@/context/ProductContext';
import { productService } from '@/services/productService';
import { Product, ProductFormData } from '@/types/product';
import { ProductForm } from '@/components/products/ProductForm';
import { TableSkeleton } from '@/components/common/Skeleton';
import { ErrorAlert } from '@/components/common/ErrorAlert';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { getLocalProductOverride, updateLocalProduct } = useProductContext();

  const id = params?.id as string;

  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    const numericId = parseInt(id, 10);

    try {
      let product: Product;
      try {
        product = await productService.getProductById(id);
      } catch (err) {
        // Check if locally added match exists
        const local = !isNaN(numericId) ? getLocalProductOverride(numericId) : null;
        if (local && local.title) {
          product = local as Product;
        } else {
          throw err;
        }
      }

      // Merge local overrides if previously edited in current session
      if (!isNaN(numericId)) {
        const local = getLocalProductOverride(numericId);
        if (local) {
          product = { ...product, ...local };
        }
      }

      setInitialData({
        title: product.title || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price ?? 0,
        stock: product.stock ?? 0,
        thumbnail: product.thumbnail || product.images?.[0] || '',
        brand: product.brand || '',
      });
    } catch (err: any) {
      setError(
        err.message || 'Failed to load product details for editing.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, getLocalProductOverride]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProduct();
    }
  }, [fetchProduct, isAuthenticated]);

  const handleSubmit = async (formData: ProductFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const numericId = parseInt(id, 10);

    try {
      // Execute PUT /products/:id via productService
      await productService.updateProduct(id, formData);

      // Persist changes in session ProductContext
      if (!isNaN(numericId)) {
        updateLocalProduct(numericId, formData);
      }

      // Redirect back to products list
      router.push('/products');
    } catch (err: any) {
      setError(err.message || 'Failed to update product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !isAuthenticated || isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorAlert
          message={error || 'Could not load product for editing.'}
          onRetry={fetchProduct}
        />
      </div>
    );
  }

  return (
    <div className="py-4">
      <ProductForm
        initialValues={initialData}
        isEditing={true}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
}
