'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { apiClient } from '@/lib/apiClient';
import { normalizeGoogleUser, saveAuth, type BackendGoogleUser } from '@/lib/auth';
import type { UserRole } from '@/types';
import { toast } from 'sonner';
import axios from 'axios';

export const TabbedLoginForm: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserRole>('student');
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

      const endpoint = activeTab === 'mentor' ? '/auth/google/mentor' : '/auth/google/user';
      const response = await apiClient.post(endpoint, { token: credential });

      console.log('Login successful:', response.data);

      const backendUser = response.data.user as BackendGoogleUser;
      
      // For mentor tab, verify user is actually a mentor
      if (activeTab === 'mentor') {
        if (backendUser.isMentor) {
          saveAuth({
            token: response.data.token,
            user: normalizeGoogleUser(backendUser, 'mentor'),
          });
          console.log('Redirecting to mentor dashboard');
          toast.success('Logged in as mentor');
          // Use window.location for immediate redirect
          window.location.href = '/mentor';
        } else {
          setError('This account is not registered as a mentor.');
          toast.error('This account is not registered as a mentor');
          setLoading(false);
        }
      } else {
        saveAuth({
          token: response.data.token,
          user: normalizeGoogleUser(backendUser, 'student'),
        });
        // Student login - redirect to student dashboard
        console.log('Redirecting to student dashboard');
        toast.success('Logged in as student');
        // Use window.location for immediate redirect
        window.location.href = '/student';
      }
    } catch (err) {
      console.error('Login error:', err);
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const serverMessage =
        axios.isAxiosError(err) && typeof (err.response?.data as any)?.message === 'string'
          ? ((err.response?.data as any).message as string)
          : undefined;

      if (activeTab === 'mentor' && status === 403) {
        setError('This account is not registered as a mentor.');
        toast.error('This account is not registered as a mentor');
      } else {
        setError(serverMessage || 'Login failed. Please try again.');
        toast.error(serverMessage || 'Login failed');
      }
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  const handleTabChange = (tab: UserRole) => {
    setActiveTab(tab);
    setError('');
  };

  const isStudent = activeTab === 'student';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleTabChange('student')}
          className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center font-semibold transition-all relative ${
            isStudent
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm sm:text-base">Student</span>
          </div>
          {isStudent && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
          )}
        </button>
        
        <button
          onClick={() => handleTabChange('mentor')}
          className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-center font-semibold transition-all relative ${
            !isStudent
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm sm:text-base">Mentor</span>
          </div>
          {!isStudent && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          )}
        </button>
      </div>

      {/* Form Content */}
      <div className="p-5 sm:p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg ${
            isStudent 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}>
            {isStudent ? (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
            {isStudent ? 'Student Login' : 'Mentor Login'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {isStudent ? 'Access your learning journey' : 'Guide and inspire students'}
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
              <svg className={`animate-spin h-5 w-5 ${isStudent ? 'text-green-600' : 'text-blue-600'}`} viewBox="0 0 24 24">
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
    </div>
  );
};
