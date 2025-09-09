
"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is not loading and we have a user
    if (!loading && user) {
      // If they are not an admin and not on the login page, send them to the login page
      if (userProfile?.role !== 'admin' && pathname !== '/admin/login') {
         router.push('/admin/login');
      }
    } else if (!loading && !user && pathname !== '/admin/login') {
      // If not loading, no user, and not on the login page, redirect to login
      router.push('/admin/login');
    }
  }, [user, userProfile, loading, router, pathname]);
  
  // Show children immediately if on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If we are still loading, or if the user is not an admin, show a spinner.
  // This protects all other admin routes.
  if (loading || !user || userProfile?.role !== 'admin') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
