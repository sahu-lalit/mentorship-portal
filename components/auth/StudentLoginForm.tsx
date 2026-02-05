'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { apiClient } from '@/lib/apiClient';
import { normalizeGoogleUser, saveAuth, type BackendGoogleUser } from '@/lib/auth';
import { toast } from 'sonner';

export const StudentLoginForm: React.FC = () => {
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

      const response = await apiClient.post('/auth/google/user', { token: credential });
      const backendUser = response.data.user as BackendGoogleUser;

      saveAuth({
        token: response.data.token,
        user: normalizeGoogleUser(backendUser, 'student'),
      });

      toast.success('Logged in as student');
      
      // Redirect to student dashboard
      router.push('/student');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      toast.error('Student login failed');
    } finally {
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
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Student Login
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Access your learning journey
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
            <svg className="animate-spin h-5 w-5 text-green-600" viewBox="0 0 24 24">
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
