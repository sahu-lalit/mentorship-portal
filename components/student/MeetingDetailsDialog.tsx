'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { clearAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

type BackendMeetingDetails = {
  id: string;
  topic: string;
  description: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  adminNotes?: string;
  meeting?: {
    mentor?: {
      id: string;
      name: string;
      email: string;
    };
    meetingSummary?: string;
    meetingDescription?: string;
    meetingStart?: string;
    meetingEnd?: string;
    meetLink?: string;
  };
};

export function MeetingDetailsDialog(props: {
  isOpen: boolean;
  meetingId: string | null;
  onClose: () => void;
}) {
  const { isOpen, meetingId, onClose } = props;
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<BackendMeetingDetails | null>(null);

  useEffect(() => {
    if (!isOpen || !meetingId) return;

    let cancelled = false;
    setLoading(true);
    setDetails(null);

    (async () => {
      try {
        const res = await apiClient.get(`/modules/user/meetings/${meetingId}`);
        const data = (res.data?.responseResult ?? null) as BackendMeetingDetails | null;
        if (!cancelled) setDetails(data);
      } catch (err) {
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 401) {
          toast.error('Session expired. Please login again.');
          clearAuth();
          return;
        }
        toast.error('Failed to load meeting details');
        console.error('Meeting details error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, meetingId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full my-8 flex flex-col max-h-[90vh]">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Meeting Details</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Request ID: {meetingId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-16 w-full" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-40" />
            </div>
          )}

          {!loading && details && (
            <>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Topic</div>
                <div className="text-base font-semibold text-gray-900 dark:text-white">{details.topic}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{details.description}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{details.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Updated</div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {details.updatedAt ? new Date(details.updatedAt).toLocaleString() : '-'}
                  </div>
                </div>
              </div>

              {!!details.meeting?.mentor && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Mentor</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{details.meeting.mentor.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{details.meeting.mentor.email}</div>
                </div>
              )}

              {!!details.meeting?.meetingStart && !!details.meeting?.meetingEnd && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Meeting start</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(details.meeting.meetingStart).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Meeting end</div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(details.meeting.meetingEnd).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {!!details.adminNotes && details.adminNotes !== 'null' && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2">Admin Notes</div>
                  <div className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">{details.adminNotes}</div>
                </div>
              )}

              {!!details.meeting?.meetLink && (
                <a
                  href={details.meeting.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Open meeting link
                </a>
              )}
            </>
          )}

          {!loading && !details && (
            <div className="text-sm text-gray-600 dark:text-gray-400">No details found.</div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl sticky bottom-0">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
