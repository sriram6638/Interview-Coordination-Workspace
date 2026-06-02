'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoggedIn(Boolean(localStorage.getItem('token')));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="text-xl font-bold text-indigo-600 hover:text-indigo-800"
          >
            Interview Coordination
          </Link>
          <span className="text-sm text-gray-500">Home</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {loggedIn ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-indigo-800">
                Dashboard
              </Link>
              <Link href="/interviews" className="text-gray-600 hover:text-indigo-800">
                Interviews
              </Link>
              <Link href="/interviews/create" className="text-gray-600 hover:text-indigo-800">
                New Interview
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-indigo-800">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
