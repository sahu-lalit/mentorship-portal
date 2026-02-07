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
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <button
          onClick={() => handleTabChange('student')}
          className={`flex-1 py-4 px-6 text-center font-bold transition-all duration-300 relative group ${
            isStudent
              ? 'text-green-700 dark:text-green-400 bg-white dark:bg-gray-800'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isStudent 
                ? 'bg-linear-to-br from-green-500 to-emerald-600 shadow-md' 
                : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
            }`}>
              <svg className={`w-5 h-5 ${
                isStudent ? 'text-white' : 'text-gray-500 dark:text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span>Student</span>
          </div>
          {isStudent && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-green-500 to-emerald-600 shadow-sm"></div>
          )}
        </button>
        
        <button
          onClick={() => handleTabChange('mentor')}
          className={`flex-1 py-4 px-6 text-center font-bold transition-all duration-300 relative group ${
            !isStudent
              ? 'text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-800'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              !isStudent 
                ? 'bg-linear-to-br from-blue-500 to-indigo-600 shadow-md' 
                : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
            }`}>
              <svg className={`w-5 h-5 ${
                !isStudent ? 'text-white' : 'text-gray-500 dark:text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span>Mentor</span>
          </div>
          {!isStudent && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-indigo-600 shadow-sm"></div>
          )}
        </button>
      </div>

      {/* Form Content */}
      <div className="p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl transform transition-all duration-300 ${
            isStudent 
              ? 'bg-linear-to-br from-green-500 to-emerald-600' 
              : 'bg-linear-to-br from-blue-500 to-indigo-600'
          }`}>
            {isStudent ? (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {isStudent ? 'Student Login' : 'Mentor Login'}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {isStudent ? 'Access your learning journey' : 'Guide and inspire students'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <svg className={`animate-spin h-5 w-5 ${isStudent ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Logging in...</span>
            </div>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="flex justify-center mb-6">
          <div className="transform transition-all duration-200 hover:scale-105">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          By continuing, you agree to our <span className="font-medium text-gray-700 dark:text-gray-300">Terms of Service</span> and <span className="font-medium text-gray-700 dark:text-gray-300">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};
