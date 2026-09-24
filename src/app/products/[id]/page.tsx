'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProductContext } from '@/context/ProductContext';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { ProductDetailsSkeleton } from '@/components/common/Skeleton';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { formatCategoryName } from '@/utils/formatters';
import {
  ArrowLeft,
  Edit,
  Star,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ImageOff,
  User,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { getLocalProductOverride, isDeletedLocally } = useProductContext();

  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const loadProduct = useCallback(async () => {
    if (!id) return;

    const numericId = parseInt(id, 10);

    // Check if deleted locally during current session
    if (!isNaN(numericId) && isDeletedLocally(numericId)) {
      setError('Product not found or has been deleted.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let data: Product;
      try {
        data = await productService.getProductById(id);
      } catch (err) {
        // Check if there is a locally added product match
        const localOverride = !isNaN(numericId)
          ? getLocalProductOverride(numericId)
          : null;
        if (localOverride && localOverride.title) {
          data = localOverride as Product;
        } else {
          throw err;
        }
      }

      // Merge local property overrides if edited in current session
      if (!isNaN(numericId)) {
        const localOverride = getLocalProductOverride(numericId);
        if (localOverride) {
          data = { ...data, ...localOverride };
        }
      }

      setProduct(data);
      setActiveImage(data.thumbnail || data.images?.[0] || '');
    } catch (err: any) {
      setError(
        err.message || 'Unable to find requested product. It may not exist.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, getLocalProductOverride, isDeletedLocally]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProduct();
    }
  }, [loadProduct, isAuthenticated]);

  if (isAuthLoading || !isAuthenticated) {
    return <ProductDetailsSkeleton />;
  }

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4">
        <ErrorAlert
          message={error || 'Requested product could not be found.'}
          onRetry={loadProduct}
        />
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Product Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const imagesList = product.images?.length
    ? product.images
    : [product.thumbnail].filter(Boolean);

  const isLowStock = product.stock <= 5 && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <Link
          href={`/products/${product.id}/edit`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Product</span>
        </Link>
      </div>

      {/* Main Product Details Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <ImageOff className="w-12 h-12 text-slate-300" />
            )}
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 shrink-0 transition-all ${
                    activeImage === imgUrl
                      ? 'border-primary-600 ring-2 ring-primary-100'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.title} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Specs */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {formatCategoryName(product.category)}
              </span>
              {product.brand && (
                <span className="text-xs font-semibold text-slate-500">
                  By {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.title}
            </h1>
          </div>

          {/* Price & Rating Row */}
          <div className="flex items-center gap-6 py-4 border-y border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium">Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  ${product.price?.toFixed(2)}
                </span>
                {product.discountPercentage && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div>
              <p className="text-xs text-slate-400 font-medium">Customer Rating</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-slate-900">
                  {product.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-slate-500">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock & Availability */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Availability Status:</span>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 font-bold text-red-600">
                  <XCircle className="w-4 h-4" /> Out of stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                  <Package className="w-4 h-4" /> Low Stock ({product.stock} items remaining)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {product.warrantyInformation && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800">Warranty</p>
                    <p className="text-slate-500">{product.warrantyInformation}</p>
                  </div>
                </div>
              )}
              {product.shippingInformation && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-primary-600 shrink-0" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800">Shipping</p>
                    <p className="text-slate-500">{product.shippingInformation}</p>
                  </div>
                </div>
              )}
              {product.returnPolicy && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-primary-600 shrink-0" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800">Return Policy</p>
                    <p className="text-slate-500">{product.returnPolicy}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Customer Reviews ({product.reviews.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {rev.reviewerName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-800">
                      {rev.rating}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic">&quot;{rev.comment}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
