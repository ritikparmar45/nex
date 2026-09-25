'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Package, PlusCircle, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link
              href="/products"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold text-xl tracking-tight"
            >
              <div className="p-2 bg-primary-50 rounded-lg border border-primary-100">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <span>Apex Admin</span>
            </Link>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-4">
            <Link
              href="/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Product</span>
            </Link>

            <div className="h-6 w-px bg-slate-200" />

            {/* User Details */}
            {user && (
              <div className="flex items-center gap-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <UserIcon className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div className="hidden md:block text-left text-xs">
                  <p className="font-semibold text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-slate-500">@{user.username}</p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Logout"
              aria-label="Logout of application"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
