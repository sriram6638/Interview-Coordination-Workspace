import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interview Coordination Workspace",
  description: "Manage and coordinate interviews efficiently",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Interview Coordination</h1>
          <div className="space-x-4">
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800">
              Login
            </Link>
            <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-bold text-gray-900">
            Welcome to Interview Coordination Workspace
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your interview process with an easy-to-use platform for scheduling, 
            managing, and coordinating interviews seamlessly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">Schedule Interviews</h3>
              <p className="text-gray-600">Easily manage interview schedules with an intuitive calendar interface.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">Track Candidates</h3>
              <p className="text-gray-600">Keep all candidate information organized in one central location.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">Collaborate</h3>
              <p className="text-gray-600">Enable seamless collaboration between interviewers and hiring teams.</p>
            </div>
          </div>

          <div className="mt-10 space-x-4">
            <Link 
              href="/auth/register" 
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Get Started
            </Link>
            <Link 
              href="/interviews" 
              className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg border border-indigo-600 hover:bg-indigo-50 font-semibold"
            >
              View Interviews
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
