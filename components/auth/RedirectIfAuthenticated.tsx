'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthUser, getAuthToken } from '@/lib/auth';

export function RedirectIfAuthenticated() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on the login route.
    if (pathname !== '/login') return;

    const user = getAuthUser();
    const token = getAuthToken();

    // If token exists but user object is missing/corrupt, don't auto-redirect.
    if (!user || !token) return;

    if (user.role === 'student') {
      router.replace('/student');
    } else if (user.role === 'mentor') {
      router.replace('/mentor');
    }
  }, [pathname, router]);

  return null;
}
