'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ScheduleMeetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    topic: string;
    details: string;
    preferredDate: string;
    preferredStartTime: string;
    preferredEndTime: string;
  }) => void;
}

export const ScheduleMeetDialog: React.FC<ScheduleMeetDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredStartTime, setPreferredStartTime] = useState('');
  const [preferredEndTime, setPreferredEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await Promise.resolve(
        onSubmit({
          topic,
          details,
          preferredDate,
          preferredStartTime,
          preferredEndTime,
        })
      );

      // Reset form on success
      setTopic('');
      setDetails('');
      setPreferredDate('');
      setPreferredStartTime('');
      setPreferredEndTime('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full my-8 flex flex-col max-h-[90vh]">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Schedule a Meeting
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Book a session with your mentor
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Topic */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., JavaScript Fundamentals"
            />
          </div>

          {/* Details */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Describe what you'd like to discuss..."
            />
          </div>

          {/* Preferred Date */}
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <input
              id="preferredDate"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Preferred Start Time */}
          <div>
            <label htmlFor="preferredStartTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Start Time <span className="text-red-500">*</span>
            </label>
            <input
              id="preferredStartTime"
              type="time"
              value={preferredStartTime}
              onChange={(e) => setPreferredStartTime(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Preferred End Time */}
          <div>
            <label htmlFor="preferredEndTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred End Time <span className="text-red-500">*</span>
            </label>
            <input
              id="preferredEndTime"
              type="time"
              value={preferredEndTime}
              onChange={(e) => setPreferredEndTime(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl sticky bottom-0">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {submitting ? 'Creating...' : 'Create Meeting'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
