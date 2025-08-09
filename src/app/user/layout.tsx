'use client';

import { RouteProtection } from '@/components/RouteProtection';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteProtection requiredRole={['USER', 'ADMIN']}>
      {children}
    </RouteProtection>
  );
}
