'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiClient } from '@/lib/apiClient';
import { clearAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/Skeleton';

type BackendProfile = {
  name: string;
  email: string;
  image?: string;
};

export function ProfileAvatarButton(props: {
  onClick: () => void;
  onUnauthorized?: () => void;
  fallbackGradientClassName: string;
  sizeClassName?: string;
}) {
  const {
    onClick,
    onUnauthorized,
    fallbackGradientClassName,
    sizeClassName = 'w-8 h-8',
  } = props;

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BackendProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await apiClient.get('/modules/profile');
        const data = (res.data?.responseResult ?? null) as BackendProfile | null;
        if (!cancelled) setProfile(data);
      } catch (err) {
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 401) {
          clearAuth();
          onUnauthorized?.();
          return;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onUnauthorized]);

  const initial = (profile?.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      aria-label="Open profile"
    >
      {loading ? (
        <Skeleton className={`${sizeClassName} rounded-lg`} />
      ) : profile?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.image}
          alt={profile.name}
          className={`${sizeClassName} rounded-lg object-cover border border-gray-200 dark:border-gray-700`}
        />
      ) : (
        <div className={`${sizeClassName} ${fallbackGradientClassName} rounded-lg flex items-center justify-center text-white font-semibold`}>
          {initial}
        </div>
      )}
    </button>
  );
}
