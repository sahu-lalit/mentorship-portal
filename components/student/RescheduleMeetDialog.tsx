'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export type RescheduleFormData = {
  preferredDate: string; // YYYY-MM-DD
  preferredStartTime: string; // HH:MM (24h)
  preferredEndTime: string; // HH:MM (24h)
};

export function RescheduleMeetDialog(props: {
  isOpen: boolean;
  title?: string;
  initialValue?: Partial<RescheduleFormData>;
  onClose: () => void;
  onSubmit: (data: RescheduleFormData) => Promise<void> | void;
}) {
  const { isOpen, title = 'Reschedule Meeting', initialValue, onClose, onSubmit } = props;

  const [preferredDate, setPreferredDate] = useState('');
  const [preferredStartTime, setPreferredStartTime] = useState('');
  const [preferredEndTime, setPreferredEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setPreferredDate(initialValue?.preferredDate ?? '');
    setPreferredStartTime(initialValue?.preferredStartTime ?? '');
    setPreferredEndTime(initialValue?.preferredEndTime ?? '');
    setTimeError('');
  }, [isOpen, initialValue?.preferredDate, initialValue?.preferredStartTime, initialValue?.preferredEndTime]);

  useEffect(() => {
    if (preferredStartTime && preferredEndTime) {
      const [startHour, startMin] = preferredStartTime.split(':').map(Number);
      const [endHour, endMin] = preferredEndTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        setTimeError('End time must be after start time');
      } else {
        setTimeError('');
      }
    } else {
      setTimeError('');
    }
  }, [preferredStartTime, preferredEndTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await Promise.resolve(
        onSubmit({
          preferredDate,
          preferredStartTime,
          preferredEndTime,
        })
      );
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose a new preferred schedule</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="rescheduleDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <input
              id="rescheduleDate"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="rescheduleStart" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Start Time <span className="text-red-500">*</span>
            </label>
            <input
              id="rescheduleStart"
              type="time"
              value={preferredStartTime}
              onChange={(e) => setPreferredStartTime(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="rescheduleEnd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred End Time <span className="text-red-500">*</span>
            </label>
            <input
              id="rescheduleEnd"
              type="time"
              value={preferredEndTime}
              onChange={(e) => setPreferredEndTime(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
            {timeError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{timeError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !!timeError}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {submitting ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
