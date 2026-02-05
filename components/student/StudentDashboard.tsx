'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';
import { ScheduleMeetDialog } from './ScheduleMeetDialog';
import { MeetingCard } from './MeetingCard';
import { MeetingDetailsDialog } from './MeetingDetailsDialog';
import { RescheduleMeetDialog, type RescheduleFormData } from './RescheduleMeetDialog';
import { clearAuth, getAuthUser } from '@/lib/auth';
import { apiClient } from '@/lib/apiClient';
import axios from 'axios';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  topic: string;
  details: string;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime?: string;
  status: 'pending' | 'scheduled' | 'cancelled' | 'completed';
  meetLink?: string;
  meetingStart?: string;
  meetingEnd?: string;
  updatedAt?: string;
}

type BackendUpcomingMeeting = {
  id: string;
  request: {
    id: string;
    preferredDate: string;
    preferredStartTime: string;
    preferredEndTime?: string;
    status: string;
    updatedAt?: string;
    topic?: string;
    description?: string;
  };
  meetingSummary?: string;
  meetingDescription?: string;
  meetingStart?: string;
  meetingEnd?: string;
  meetLink?: string;
};

type BackendHistoryItem = {
  id: string;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime?: string;
  status: string;
  updatedAt?: string;
  topic?: string;
  description?: string;
  meeting?: {
    meetingSummary?: string;
    meetingDescription?: string;
    meetingStart?: string;
    meetingEnd?: string;
    meetLink?: string;
  };
};

type BackendPendingRequest = {
  id: string;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime?: string;
  status: string;
  updatedAt?: string;
  topic?: string;
  description?: string;
};

const mapBackendStatus = (status: string): Meeting['status'] => {
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

const toAmPm = (time24: string) => {
  // Input: "HH:MM" from <input type="time" />
  const [hoursRaw, minutesRaw] = time24.split(':');
  const hours = Number(hoursRaw);
  const minutes = minutesRaw ?? '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const toTime24 = (value: string | undefined) => {
  const raw = (value ?? '').trim();
  if (!raw) return '';

  // Already HH:MM
  if (/^\d{1,2}:\d{2}$/.test(raw)) return raw;

  // Parse "7:33 PM"
  const m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return '';
  let hours = Number(m[1]);
  const minutes = m[2];
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const isoDateFromYmd = (ymd: string) => {
  // Backend examples use midnight UTC ISO.
  return `${ymd}T00:00:00.000Z`;
};

export const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'requests' | 'history'>('home');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Meeting[]>([]);
  const [historyMeetings, setHistoryMeetings] = useState<Meeting[]>([]);
  const [meetingsLoading, setMeetingsLoading] = useState(false);
  const [detailsMeetingId, setDetailsMeetingId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleMeetingId, setRescheduleMeetingId] = useState<string | null>(null);
  const [rescheduleInitial, setRescheduleInitial] = useState<Partial<RescheduleFormData>>({});

  const fetchMeetings = async () => {
    setMeetingsLoading(true);
    try {
      const [upcomingRes, requestsRes, historyRes] = await Promise.all([
        apiClient.get('/modules/user/meetings/upcomming'),
        apiClient.get('/modules/user/requests'),
        apiClient.get('/modules/user/history'),
      ]);

      const upcomingRaw = (upcomingRes.data?.responseResult ?? []) as BackendUpcomingMeeting[];
      const requestsRaw = (requestsRes.data?.responseResult ?? []) as BackendPendingRequest[];
      const historyRaw = (historyRes.data?.responseResult ?? []) as BackendHistoryItem[];

      const mappedUpcoming: Meeting[] = upcomingRaw.map((m) => ({
        id: m.request?.id ?? m.id,
        topic: m.request?.topic ?? m.meetingSummary ?? 'Upcoming Meeting',
        details: m.request?.description ?? m.meetingDescription ?? '',
        preferredDate: m.request?.preferredDate,
        preferredStartTime: m.request?.preferredStartTime,
        preferredEndTime: m.request?.preferredEndTime,
        status: mapBackendStatus(m.request?.status),
        meetLink: m.meetLink,
        meetingStart: m.meetingStart,
        meetingEnd: m.meetingEnd,
        updatedAt: m.request?.updatedAt,
      }));

      const mappedHistory: Meeting[] = historyRaw.map((h) => ({
        id: h.id,
        topic: h.topic ?? h.meeting?.meetingSummary ?? 'Meeting',
        details: h.description ?? h.meeting?.meetingDescription ?? '',
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
      const mappedRequests: Meeting[] = requestsRaw.map((r) => ({
        id: r.id,
        topic: r.topic ?? 'Mentorship Request',
        details: r.description ?? `Status: ${r.status}`,
        preferredDate: r.preferredDate,
        preferredStartTime: r.preferredStartTime,
        preferredEndTime: r.preferredEndTime,
        status: mapBackendStatus(r.status),
        updatedAt: r.updatedAt,
      }));
      setPendingRequests(mappedRequests);
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
      console.error('Fetch meetings error:', err);
    } finally {
      setMeetingsLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    setDetailsMeetingId(id);
    setIsDetailsOpen(true);
  };

  const handleCancelMeeting = async (id: string) => {
    try {
      const res = await apiClient.get(`/modules/user/meetings/${id}/cancel`);
      const msg = typeof (res.data as any)?.message === 'string' ? (res.data as any).message : undefined;
      toast.success(msg || 'Meeting request cancelled');
      await fetchMeetings();
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

  const handleRescheduleMeeting = async (id: string) => {
    // New API requires POST with payload; open dialog instead.
    const all = [...upcomingMeetings, ...pendingRequests, ...historyMeetings];
    const found = all.find((m) => m.id === id);
    setRescheduleMeetingId(id);
    setRescheduleInitial({
      preferredDate: found?.preferredDate ? found.preferredDate.split('T')[0] : '',
      preferredStartTime: toTime24(found?.preferredStartTime),
      preferredEndTime: toTime24(found?.preferredEndTime),
    });
    setIsRescheduleOpen(true);
  };

  const submitRescheduleMeeting = async (data: RescheduleFormData) => {
    if (!rescheduleMeetingId) return;

    try {
      const payload = {
        preferredDate: isoDateFromYmd(data.preferredDate),
        preferredStartTime: toAmPm(data.preferredStartTime),
        preferredEndTime: toAmPm(data.preferredEndTime),
      };

      const res = await apiClient.post(`/modules/user/meetings/${rescheduleMeetingId}/reschedule`, payload);
      const msg = typeof (res.data as any)?.message === 'string' ? (res.data as any).message : undefined;
      toast.success(msg || 'Meeting request has been rescheduled.');
      await fetchMeetings();
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
      toast.error(serverMessage || 'Failed to reschedule meeting request');
      throw err;
    }
  };

  useEffect(() => {
    const parsedUser = getAuthUser();
    if (!parsedUser) {
      router.push('/login');
      return;
    }

    if (parsedUser.role !== 'student') {
      router.push('/login');
    } else {
      setUser(parsedUser as unknown as User);
    }

    fetchMeetings();
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const handleCreateMeeting = async (meetingData: Omit<Meeting, 'id' | 'status'>) => {
    try {
      // Backend expects ISO date string and 12-hour time like "10:00 AM".
      const payload = {
        topic: meetingData.topic,
        description: meetingData.details,
        preferredDate: `${meetingData.preferredDate}T00:00:00.000Z`,
        preferredStartTime: toAmPm(meetingData.preferredStartTime),
        preferredEndTime: meetingData.preferredEndTime ? toAmPm(meetingData.preferredEndTime) : undefined,
      };

      await apiClient.post('/modules/user/requests', payload);
      toast.success('Mentorship request created successfully');

      // Refresh lists so UI reflects backend state.
      await fetchMeetings();
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
        throw err;
      }

      toast.error(serverMessage || 'Failed to create mentorship request');
      throw err;
    }
  };

  const handleUpdateStatus = () => {
    // Removed: status updates are not a student action.
  };

  const handleReschedule = (id: string) => {
    handleRescheduleMeeting(id);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const activeMeetings = upcomingMeetings;

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
            {activeTab === 'home' ? 'Dashboard' : activeTab === 'requests' ? 'Requests' : 'History'}
          </h1>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`w-64 bg-white dark:bg-gray-800 shadow-lg fixed h-full z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 dark:text-white">Student</h2>
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
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
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
                setActiveTab('requests');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'requests'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Pending Requests</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('history');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'history'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">History</span>
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
              {activeTab === 'home'
                ? 'Dashboard'
                : activeTab === 'requests'
                  ? 'Pending Requests'
                  : 'Meeting History'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {activeTab === 'home'
                ? 'Schedule and manage your mentorship sessions'
                : activeTab === 'requests'
                  ? 'View your pending and reschedule requests'
                  : 'View your completed and cancelled meetings'}
            </p>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'home' ? (
            <div className="space-y-6">
              {meetingsLoading && (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                </div>
              )}

              {/* Create Meeting Card */}
              <button
                onClick={() => setIsDialogOpen(true)}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 sm:p-8 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      Schedule a Meet with Mentor
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Click to create a new mentorship session
                    </p>
                  </div>
                </div>
              </button>

              {/* Active Meetings */}
              {activeMeetings.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Your Meetings
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {activeMeetings.map(meeting => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onViewDetails={handleViewDetails}
                        onCancel={handleCancelMeeting}
                        onReschedule={handleReschedule}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'requests' ? (
            <div>
              {meetingsLoading && (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                </div>
              )}

              {pendingRequests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {pendingRequests.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onViewDetails={handleViewDetails}
                      onCancel={handleCancelMeeting}
                      onReschedule={handleReschedule}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No pending requests
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Your pending mentorship requests will appear here
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {meetingsLoading && (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                </div>
              )}

              {historyMeetings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {historyMeetings.map(meeting => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onViewDetails={handleViewDetails}
                      onCancel={handleCancelMeeting}
                      onReschedule={handleReschedule}
                      isHistory
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No meeting history
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Your completed and cancelled meetings will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Schedule Meet Dialog */}
      <ScheduleMeetDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateMeeting}
      />

      <MeetingDetailsDialog
        isOpen={isDetailsOpen}
        meetingId={detailsMeetingId}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailsMeetingId(null);
        }}
      />

      <RescheduleMeetDialog
        isOpen={isRescheduleOpen}
        initialValue={rescheduleInitial}
        onClose={() => {
          setIsRescheduleOpen(false);
          setRescheduleMeetingId(null);
          setRescheduleInitial({});
        }}
        onSubmit={submitRescheduleMeeting}
      />
    </div>
  );
};
