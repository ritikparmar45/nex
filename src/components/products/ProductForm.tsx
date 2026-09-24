'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Category, ProductFormData } from '@/types/product';
import { productService } from '@/services/productService';
import { formatCategoryName, getCategorySlug } from '@/utils/formatters';
import { ArrowLeft, Loader2, Save, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  initialValues?: Partial<ProductFormData>;
  isEditing?: boolean;
  isSubmitting: boolean;
  onSubmit: (data: ProductFormData) => void;
  error?: string | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  isEditing = false,
  isSubmitting,
  onSubmit,
  error,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    category: initialValues?.category || '',
    price: initialValues?.price ?? 0,
    stock: initialValues?.stock ?? 0,
    thumbnail: initialValues?.thumbnail || 'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
    brand: initialValues?.brand || '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        category: initialValues.category || '',
        price: initialValues.price ?? 0,
        stock: initialValues.stock ?? 0,
        thumbnail:
          initialValues.thumbnail ||
          'https://cdn.dummyjson.com/product-images/1/thumbnail.jpg',
        brand: initialValues.brand || '',
      });
    }
  }, [initialValues]);

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => setCategories(res || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than $0';
    }
    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    if (!formData.thumbnail.trim()) {
      newErrors.thumbnail = 'Thumbnail image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // double-submission protection
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto space-y-6"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Edit Product Details' : 'Create New Product'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditing
              ? 'Update the fields below to modify this product.'
              : 'Fill in the information to add a new product.'}
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Grid Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label
            htmlFor="title"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g. Wireless Noise-Canceling Headphones"
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.title
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-200 focus:ring-primary-500'
            }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.category
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-200 focus:ring-primary-500'
            }`}
          >
            <option value="">Select Category</option>
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
          {errors.category && (
            <p className="mt-1.5 text-xs text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label
            htmlFor="brand"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Brand
          </label>
          <input
            id="brand"
            type="text"
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
            placeholder="e.g. Sony, Apple, Nike"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
            }
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.price
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-200 focus:ring-primary-500'
            }`}
          />
          {errors.price && (
            <p className="mt-1.5 text-xs text-red-600">{errors.price}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label
            htmlFor="stock"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
            }
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.stock
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-200 focus:ring-primary-500'
            }`}
          />
          {errors.stock && (
            <p className="mt-1.5 text-xs text-red-600">{errors.stock}</p>
          )}
        </div>

        {/* Thumbnail URL */}
        <div className="md:col-span-2">
          <label
            htmlFor="thumbnail"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Thumbnail Image URL <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="thumbnail"
              type="text"
              value={formData.thumbnail}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className={`flex-1 px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.thumbnail
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-primary-500'
              }`}
            />
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
              {formData.thumbnail ? (
                <img
                  src={formData.thumbnail}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </div>
          {errors.thumbnail && (
            <p className="mt-1.5 text-xs text-red-600">{errors.thumbnail}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label
            htmlFor="description"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Write a clear overview of product specifications and features..."
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              errors.description
                ? 'border-red-300 focus:ring-red-500'
                : 'border-slate-200 focus:ring-primary-500'
            }`}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Link
          href="/products"
          className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
