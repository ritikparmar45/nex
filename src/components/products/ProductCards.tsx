'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatCategoryName } from '@/utils/formatters';
import { Eye, Edit, Trash2, Star, ImageOff } from 'lucide-react';

interface ProductCardsProps {
  products: Product[];
  onDeleteClick: (product: Product) => void;
}

export const ProductCards: React.FC<ProductCardsProps> = ({
  products,
  onDeleteClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
      {products.map((product) => {
        const thumbnail = product.thumbnail || product.images?.[0];
        const isLowStock = product.stock <= 5 && product.stock > 0;
        const isOutOfStock = product.stock === 0;

        return (
          <div
            key={product.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3"
          >
            {/* Card Header & Image */}
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                  {formatCategoryName(product.category)}
                </span>
                <Link
                  href={`/products/${product.id}`}
                  className="font-bold text-slate-900 hover:text-primary-600 line-clamp-1 block text-sm"
                >
                  {product.title}
                </Link>
                <p className="text-xs text-slate-500 font-medium">
                  {product.brand || 'Generic'}
                </p>
              </div>
            </div>

            {/* Price & Rating & Stock */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-400">Price</p>
                <p className="font-bold text-slate-900 text-base">
                  ${product.price?.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-800 text-xs">
                  {product.rating?.toFixed(1) || '0.0'}
                </span>
              </div>

              <div>
                {isOutOfStock ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                    Out of stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {product.stock} left
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {product.stock} in stock
                  </span>
                )}
              </div>
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Link
                href={`/products/${product.id}`}
                className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </Link>
              <Link
                href={`/products/${product.id}/edit`}
                className="flex-1 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
              <button
                onClick={() => onDeleteClick(product)}
                className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
