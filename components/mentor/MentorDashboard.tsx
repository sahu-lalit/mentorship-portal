'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';
import { clearAuth, getAuthUser } from '@/lib/auth';

export const MentorDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const parsedUser = getAuthUser();
    if (!parsedUser) {
      router.push('/login');
      return;
    }

    if (parsedUser.role !== 'mentor') {
      router.push('/login');
    } else {
      setUser(parsedUser as unknown as User);
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Mentor Dashboard
          </h1>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 truncate">
              Welcome, {user.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* My Students Card */}
          <Card>
            <CardHeader>
              <CardTitle>My Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View and manage your mentees
              </p>
              <Button variant="primary" size="sm" className="w-full">
                View Students
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Sessions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Schedule and conduct mentorship sessions
              </p>
              <Button variant="primary" size="sm" className="w-full">
                View Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Session Requests Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Review and approve session requests
              </p>
              <Button variant="primary" size="sm" className="w-full">
                View Requests
              </Button>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Share study materials with students
              </p>
              <Button variant="primary" size="sm" className="w-full">
                Manage Resources
              </Button>
            </CardContent>
          </Card>

          {/* Messages Card */}
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Chat with your students
              </p>
              <Button variant="primary" size="sm" className="w-full">
                Open Messages
              </Button>
            </CardContent>
          </Card>

          {/* Performance Analytics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track student progress and your impact
              </p>
              <Button variant="primary" size="sm" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
