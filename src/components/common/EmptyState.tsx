import React from 'react';
import { PackageSearch, XCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  description = 'We couldn’t find any products matching your search or active filters.',
  onClearFilters,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center my-6 max-w-lg mx-auto shadow-sm">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
        <PackageSearch className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        {description}
      </p>

      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-sm"
        >
          <XCircle className="w-4 h-4" />
          <span>Clear Filters</span>
        </button>
      )}
    </div>
  );
};
