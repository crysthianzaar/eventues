'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if we're in a protected route (infos or payment)
    const isProtectedRoute = pathname.includes('/infos') || pathname.includes('/payment');
    
    // Skip protection for tickets route
    if (!isProtectedRoute) {
      return;
    }

    // Check if user is logged in by looking for user_id in localStorage
    // We need to check if window is defined since localStorage is only available in browser
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    
    if (!userId && isProtectedRoute) {
      // User is not logged in and trying to access a protected route
      // Store the current URL to redirect back after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', pathname);
      }
      
      // Redirect to login page with message param
      router.push('/login?message=auth_required');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
