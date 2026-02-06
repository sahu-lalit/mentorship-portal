'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';
import { clearAuth, getAuthUser } from '@/lib/auth';
import { apiClient } from '@/lib/apiClient';
import axios from 'axios';
import { toast } from 'sonner';
import { MentorMeetingCard, type MentorMeetingItem } from './MentorMeetingCard';
import { MentorMeetingDetailsDialog } from './MentorMeetingDetailsDialog';
import { ProfileTab } from '@/components/profile/ProfileTab';
import { ProfileAvatarButton } from '@/components/profile/ProfileAvatarButton';
import { Skeleton } from '@/components/ui/Skeleton';

type BackendMentorUpcomingMeeting = {
  id: string;
  request: {
    id: string;
    preferredDate: string;
    preferredStartTime: string;
    preferredEndTime?: string;
    status: string;
    updatedAt?: string;
    user?: {
      name: string;
      email: string;
    };
  };
  meetingStart?: string;
  meetingEnd?: string;
  meetLink?: string;
};

type BackendMentorHistoryItem = {
  id: string;
  user?: {
    name: string;
    email: string;
  };
  meeting?: {
    meetingStart?: string;
    meetingEnd?: string;
    meetLink?: string;
  };
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime?: string;
  status: string;
  updatedAt?: string;
};

const mapBackendStatus = (status: string): MentorMeetingItem['status'] => {
  switch (status?.toUpperCase?.()) {
    case 'SCHEDULED':
      return 'scheduled';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    case 'PENDING':
    case 'REQUESTED':
    default:
      return 'pending';
  }
};

export const MentorDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'profile'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [upcomingMeetings, setUpcomingMeetings] = useState<MentorMeetingItem[]>([]);
  const [historyMeetings, setHistoryMeetings] = useState<MentorMeetingItem[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);

  const [detailsMeetingId, setDetailsMeetingId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const parsedUser = getAuthUser();
    if (!parsedUser) {
      router.push('/login');
      return;
    }
    if (parsedUser.role !== 'mentor') {
      router.push('/login');
      return;
    }
    setUser(parsedUser as unknown as User);
  }, [router]);

  const fetchMentorMeetings = async () => {
    setMeetingsLoading(true);
    try {
      const [upcomingRes, historyRes] = await Promise.all([
        apiClient.get('/modules/mentor/meetings/upcomming'),
        apiClient.get('/modules/mentor/history'),
      ]);

      const upcomingRaw = (upcomingRes.data?.responseResult ?? []) as BackendMentorUpcomingMeeting[];
      const historyRaw = (historyRes.data?.responseResult ?? []) as BackendMentorHistoryItem[];

      const mappedUpcoming: MentorMeetingItem[] = upcomingRaw.map((m) => ({
        id: m.request?.id ?? m.id,
        studentName: m.request?.user?.name ?? 'Student',
        studentEmail: m.request?.user?.email ?? '',
        preferredDate: m.request?.preferredDate,
        preferredStartTime: m.request?.preferredStartTime,
        preferredEndTime: m.request?.preferredEndTime,
        status: mapBackendStatus(m.request?.status),
        meetLink: m.meetLink,
        meetingStart: m.meetingStart,
        meetingEnd: m.meetingEnd,
        updatedAt: m.request?.updatedAt,
      }));

      const mappedHistory: MentorMeetingItem[] = historyRaw.map((h) => ({
        id: h.id,
        studentName: h.user?.name ?? 'Student',
        studentEmail: h.user?.email ?? '',
        preferredDate: h.preferredDate,
        preferredStartTime: h.preferredStartTime,
        preferredEndTime: h.preferredEndTime,
        status: mapBackendStatus(h.status),
        meetLink: h.meeting?.meetLink,
        meetingStart: h.meeting?.meetingStart,
        meetingEnd: h.meeting?.meetingEnd,
        updatedAt: h.updatedAt,
      }));

      setUpcomingMeetings(mappedUpcoming);
      setHistoryMeetings(mappedHistory);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (status === 401) {
        toast.error('Session expired. Please login again.');
        clearAuth();
        router.push('/login');
        return;
      }
      toast.error('Failed to load meetings');
      console.error('Fetch mentor meetings error:', err);
    } finally {
      setMeetingsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchMentorMeetings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleViewDetails = (id: string) => {
    setDetailsMeetingId(id);
    setIsDetailsOpen(true);
  };

  const handleCancelMeeting = async (id: string) => {
    try {
      const res = await apiClient.get(`/modules/mentor/meetings/${id}/cancel`);
      const msg = typeof (res.data as any)?.message === 'string' ? (res.data as any).message : undefined;
      toast.success(msg || 'Meeting request cancelled');
      await fetchMentorMeetings();
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const serverMessage =
        axios.isAxiosError(err) && typeof (err.response?.data as any)?.message === 'string'
          ? ((err.response?.data as any).message as string)
          : undefined;
      if (status === 401) {
        toast.error('Session expired. Please login again.');
        clearAuth();
        router.push('/login');
        return;
      }
      toast.error(serverMessage || 'Failed to cancel meeting request');
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-sm px-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {activeTab === 'home' ? 'Dashboard' : activeTab === 'history' ? 'History' : 'Profile'}
          </h1>
        </div>
        <ProfileAvatarButton
          onClick={() => setActiveTab('profile')}
          onUnauthorized={() => router.push('/login')}
          fallbackGradientClassName="bg-linear-to-br from-blue-500 to-indigo-600"
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`w-64 bg-white dark:bg-gray-800 shadow-lg fixed h-full z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 dark:text-white">Mentor</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.name}</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => {
                setActiveTab('home');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'home'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Home</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('history');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">History</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {activeTab === 'home' ? 'Upcoming Meetings' : activeTab === 'history' ? 'Meeting History' : 'Profile'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {activeTab === 'home'
                ? 'Your scheduled mentorship meetings'
                : activeTab === 'history'
                  ? 'Your completed and cancelled meetings'
                  : 'Your account information'}
            </p>
          </div>

          {meetingsLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-56 mb-4" />
                <Skeleton className="h-9 w-28" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <Skeleton className="h-5 w-40 mb-3" />
                <Skeleton className="h-4 w-56 mb-4" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          ) : activeTab === 'home' ? (
            upcomingMeetings.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming meetings</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Scheduled meetings will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {upcomingMeetings.map((m) => (
                  <MentorMeetingCard
                    key={m.id}
                    meeting={m}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancelMeeting}
                  />
                ))}
              </div>
            )
          ) : activeTab === 'history' ? (
            historyMeetings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No meeting history</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Completed and cancelled meetings will appear here.</p>
            </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {historyMeetings.map((m) => (
                <MentorMeetingCard
                  key={m.id}
                  meeting={m}
                  onViewDetails={handleViewDetails}
                  onCancel={handleCancelMeeting}
                  isHistory
                />
              ))}
            </div>
            )
          ) : (
            <ProfileTab
              onUnauthorized={() => {
                router.push('/login');
              }}
            />
          )}

          <MentorMeetingDetailsDialog
            isOpen={isDetailsOpen}
            meetingId={detailsMeetingId}
            onClose={() => {
              setIsDetailsOpen(false);
              setDetailsMeetingId(null);
            }}
          />
        </div>
      </main>
    </div>
  );
};
