'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalInterviews: number;
  scheduledInterviews: number;
  completedInterviews: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Interview Coordination</h1>
          <div className="space-x-4">
            <Link href="/interviews" className="text-indigo-600 hover:text-indigo-800">
              Interviews
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/');
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Welcome to your Dashboard</h2>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Total Interviews</h3>
              <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalInterviews}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Scheduled</h3>
              <p className="text-4xl font-bold text-blue-600 mt-2">{stats.scheduledInterviews}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Completed</h3>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats.completedInterviews}</p>
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/interviews"
              className="block p-4 border border-indigo-300 rounded-lg text-indigo-600 hover:bg-indigo-50 font-semibold"
            >
              View All Interviews
            </Link>
            <Link
              href="/interviews/create"
              className="block p-4 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 font-semibold text-center"
            >
              Schedule New Interview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
