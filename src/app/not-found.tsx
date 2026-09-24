import Link from 'next/link';
import { PackageX, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-3xl flex items-center justify-center mb-6 text-slate-400">
        <PackageX className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The product page or requested resource could not be found. It may have been moved, deleted, or does not exist.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    </div>
  );
}
