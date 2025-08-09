'use client';

import { RouteProtection } from '@/components/RouteProtection';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteProtection requiredRole={['SELLER', 'ADMIN']}>
      {children}
    </RouteProtection>
  );
}
