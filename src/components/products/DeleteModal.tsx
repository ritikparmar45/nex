'use client';

import React from 'react';
import { Product } from '@/types/product';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  product: Product | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  product,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3
              id="delete-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              Delete Product
            </h3>
            <p className="text-xs text-slate-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900 font-mono">
            &quot;{product.title}&quot;
          </span>
          ?
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Product</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
