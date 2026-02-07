'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export type MentorMeetingItem = {
  id: string; // request id
  studentName: string;
  studentEmail: string;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime?: string;
  status: 'pending' | 'scheduled' | 'cancelled' | 'completed';
  meetLink?: string;
  meetingStart?: string;
  meetingEnd?: string;
  updatedAt?: string;
};

export function MentorMeetingCard(props: {
  meeting: MentorMeetingItem;
  onViewDetails: (id: string) => void;
  onCancel: (id: string) => void;
  isHistory?: boolean;
}) {
  const { meeting, onViewDetails, onCancel, isHistory = false } = props;

  const getStatusColor = (status: MentorMeetingItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const trimmed = (timeString ?? '').trim();
    if (!trimmed) return '';
    if (/\b(am|pm)\b/i.test(trimmed)) {
      return trimmed.replace(/\s+/g, ' ').toUpperCase();
    }
    const [hoursRaw, minutesRaw] = trimmed.split(':');
    const hour = Number(hoursRaw);
    const minutes = minutesRaw ?? '00';
    if (Number.isNaN(hour)) return trimmed;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
            {meeting.studentName || 'Student'}
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{meeting.studentEmail}</div>

          <div className="mt-2 flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            {meeting.meetingStart && meeting.meetingEnd ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Start:</span>
                <span>{formatDateTime(meeting.meetingStart)}</span>
                <span className="text-gray-400 mx-1">•</span>
                <span className="font-medium">End:</span>
                <span>{formatDateTime(meeting.meetingEnd)}</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(meeting.preferredDate)}
                </span>
                <span className="text-gray-400">•</span>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(meeting.preferredStartTime)}
                  {meeting.preferredEndTime ? ` - ${formatTime(meeting.preferredEndTime)}` : ''}
                </span>
              </>
            )}
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(meeting.status)}`}>
          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
        </span>
      </div>

      {!!meeting.meetLink && (
        <a
          href={meeting.meetLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Join meeting
        </a>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onViewDetails(meeting.id)} className="text-xs">
          Details
        </Button>

        {!isHistory && (meeting.status === 'pending' || meeting.status === 'scheduled') && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCancel(meeting.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 border-red-300 hover:border-red-400 text-xs"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
