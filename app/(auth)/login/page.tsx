import { TabbedLoginForm } from '@/components/auth/TabbedLoginForm';
import { RedirectIfAuthenticated } from '@/components/auth/RedirectIfAuthenticated';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 sm:px-6 py-8 sm:py-12">
      <RedirectIfAuthenticated />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
            Mentorship Portal
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Connect, Learn, and Grow Together
          </p>
        </div>

        {/* Tabbed Login Card */}
        <TabbedLoginForm />
      </div>
    </div>
  );
}
