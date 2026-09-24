'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatCurrency, formatCategoryName } from '@/utils/formatters';
import { Eye, Edit, Trash2, Star, ImageOff } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onDeleteClick: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onDeleteClick,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4 w-20">
                Product
              </th>
              <th scope="col" className="py-3.5 px-4">
                Title & Brand
              </th>
              <th scope="col" className="py-3.5 px-4">
                Category
              </th>
              <th scope="col" className="py-3.5 px-4">
                Price
              </th>
              <th scope="col" className="py-3.5 px-4">
                Rating
              </th>
              <th scope="col" className="py-3.5 px-4">
                Stock
              </th>
              <th scope="col" className="py-3.5 px-4 text-right pr-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {products.map((product) => {
              const thumbnail = product.thumbnail || product.images?.[0];
              const isLowStock = product.stock <= 5 && product.stock > 0;
              const isOutOfStock = product.stock === 0;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Thumbnail Image */}
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback image handling
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <ImageOff className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </td>

                  {/* Title & Brand */}
                  <td className="py-3 px-4">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-slate-900 hover:text-primary-600 line-clamp-1 block transition-colors"
                    >
                      {product.title}
                    </Link>
                    <span className="text-xs text-slate-500 font-normal">
                      {product.brand || 'Generic'}
                    </span>
                  </td>

                  {/* Category Badge */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {formatCategoryName(product.category)}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    ${product.price?.toFixed(2)}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="font-semibold text-slate-800 text-xs">
                        {product.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        Out of stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {product.stock} left
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {product.stock} in stock
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onDeleteClick(product)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
