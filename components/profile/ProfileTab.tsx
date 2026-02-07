'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { clearAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

type BackendProfile = {
  name: string;
  email: string;
  image?: string;
};

export function ProfileTab(props: { onUnauthorized?: () => void }) {
  const { onUnauthorized } = props;
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BackendProfile | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/modules/profile');
      const data = (res.data?.responseResult ?? null) as BackendProfile | null;
      setProfile(data);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 401) {
        toast.error('Session expired. Please login again.');
        clearAuth();
        onUnauthorized?.();
        return;
      }
      toast.error('Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !profile) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-5 w-56" />
            </div>
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">Profile not available</h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">Please try again.</p>
        <Button variant="outline" size="sm" onClick={fetchProfile}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
        <div className="flex items-center gap-4 sm:gap-6">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {(profile.name || 'U').trim().charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{profile.name}</div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Email</div>
            <div className="text-sm sm:text-base text-gray-900 dark:text-white truncate">{profile.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
