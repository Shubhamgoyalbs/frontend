'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallback?: React.ReactNode;
}

// Define route permissions based on your current structure
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/user': ['USER', 'ADMIN'],
  '/user/cart': ['USER', 'ADMIN'],
  '/user/orders': ['USER', 'ADMIN'],
  '/user/profile': ['USER', 'ADMIN'],
  '/user/home': ['USER', 'ADMIN'],
  '/user/sellers': ['USER', 'ADMIN'],
  '/user/sellers/seller': ['USER', 'ADMIN'],
  '/seller': ['SELLER', 'ADMIN'],
  '/seller/home': ['SELLER', 'ADMIN'],
  '/admin': ['ADMIN'],
};

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        You are not authorized to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.history.back()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  </div>
);

const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const { role, loading, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If still loading, don't do anything
    if (loading) return;

    // If no token, redirect to login
    if (!token) {
      router.push('/login');
      return;
    }

    // Check role-based access
    let allowedRoles: string[] = [];

    if (requiredRole) {
      // If specific role is required
      allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    } else {
      // Use route-based permissions
      const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route => 
        pathname.startsWith(route)
      );
      
      if (matchedRoute) {
        allowedRoles = ROUTE_PERMISSIONS[matchedRoute];
      }
    }

    // If role is required and user doesn't have it, show unauthorized
    if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
      // Don't redirect, just show unauthorized component
      return;
    }
  }, [loading, token, role, pathname, router, requiredRole]);

  // Show loading while checking authentication
  if (loading) {
    return fallback || <LoadingPage />;
  }

  // If no token, don't render anything (redirect will happen)
  if (!token) {
    return fallback || <LoadingPage />;
  }

  // Check role-based access
  let allowedRoles: string[] = [];

  if (requiredRole) {
    allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  } else {
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route => 
      pathname.startsWith(route)
    );
    
    if (matchedRoute) {
      allowedRoles = ROUTE_PERMISSIONS[matchedRoute];
    }
  }

  // If role is required and user doesn't have it
  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return fallback || <UnauthorizedPage />;
  }

  // User is authorized, render children
  return <>{children}</>;
};
