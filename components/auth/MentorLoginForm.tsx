'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { apiClient } from '@/lib/apiClient';
import { normalizeGoogleUser, saveAuth, type BackendGoogleUser } from '@/lib/auth';
import { toast } from 'sonner';
import axios from 'axios';

export const MentorLoginForm: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const credential = credentialResponse.credential;
      if (!credential) {
        throw new Error('Missing Google credential');
      }

      const response = await apiClient.post('/auth/google/mentor', { token: credential });
      const backendUser = response.data.user as BackendGoogleUser;

      // Mentor-only gate
      if (backendUser.isMentor) {
        saveAuth({
          token: response.data.token,
          user: normalizeGoogleUser(backendUser, 'mentor'),
        });
        toast.success('Logged in as mentor');
        router.push('/mentor');
      } else {
        setError('This account is not registered as a mentor.');
        toast.error('This account is not registered as a mentor');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const serverMessage =
        axios.isAxiosError(err) && typeof (err.response?.data as any)?.message === 'string'
          ? ((err.response?.data as any).message as string)
          : undefined;

      if (status === 403) {
        setError('This account is not registered as a mentor.');
        toast.error('This account is not registered as a mentor');
      } else {
        setError(serverMessage || 'Login failed. Please try again.');
        toast.error(serverMessage || 'Mentor login failed');
      }
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">
      {/* Card Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Mentor Login
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Guide and inspire students
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">Logging in...</span>
          </div>
        </div>
      )}

      {/* Google OAuth Button */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
        />
      </div>

      {/* Info Text */}
      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};
