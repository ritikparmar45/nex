'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProductContext } from '@/context/ProductContext';
import { productService } from '@/services/productService';
import { ProductFormData } from '@/types/product';
import { ProductForm } from '@/components/products/ProductForm';

export default function NewProductPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { addLocalProduct } = useProductContext();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleSubmit = async (data: ProductFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Execute POST /products/add via productService
      const newProduct = await productService.addProduct(data);

      // Assign a unique local ID if server returns non-unique simulated id
      const createdProduct = {
        ...newProduct,
        id: newProduct.id || Date.now(),
        price: data.price,
        stock: data.stock,
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail,
        brand: data.brand || 'Generic',
        rating: 4.5,
        images: [data.thumbnail],
      };

      // Persist in session ProductContext
      addLocalProduct(createdProduct);

      // Redirect back to products dashboard
      router.push('/products');
    } catch (err: any) {
      setError(err.message || 'Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="py-4">
      <ProductForm
        isEditing={false}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
}
