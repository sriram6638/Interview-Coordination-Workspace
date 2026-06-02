'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';

type Interview = {
  id: string;
  title: string;
  position: string;
  description: string | null;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
};

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/interviews/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Interview not found');
          }
          throw new Error('Failed to load interview');
        }

        const data = await response.json();
        setInterview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [params.id, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/interviews" className="text-indigo-600 hover:underline mb-6 inline-block">
          &larr; Back to Interviews
        </Link>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">Loading interview...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : interview ? (
          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{interview.title}</h2>
              <p className="text-gray-600 mt-2">Position: {interview.position}</p>
              <p className="text-gray-600 mt-1">Status: {interview.status}</p>
            </div>

            {interview.scheduledAt && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700">Scheduled for: {new Date(interview.scheduledAt).toLocaleString()}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700 mt-2">
                {interview.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Created at: {new Date(interview.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Interview details are not available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
