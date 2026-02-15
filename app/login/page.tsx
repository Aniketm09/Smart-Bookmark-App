"use client";

import { supabase } from "../../lib/supabase";

export default function Login() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        {/* Logo / Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🔖 Smart Bookmark
          </h1>
          <p className="text-gray-500 mt-2">
            Save and manage your bookmarks securely.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* OAuth Info */}
        <p className="text-sm text-gray-600 mb-6">
          Sign up or log in using your Google account.
          <br />
        </p>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-md transition font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.4 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.7 0 5.1 1 7.1 2.6l5.7-5.7C33.3 6.1 28.9 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.5-8.4 19.5-20 0-1.3-.1-2.3-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c2.7 0 5.1 1 7.1 2.6l5.7-5.7C33.3 6.1 28.9 4 24 4c-7.8 0-14.5 4.4-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.1 0 9.8-2 13.4-5.3l-6.2-5.1C29.2 35 26.8 36 24 36c-5.2 0-9.4-2.9-11.3-7.2l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.3 5.4-6.1 6.9l6.2 5.1C39.5 36.4 43.6 30.9 43.6 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Security Note */}
        <p className="text-xs text-gray-400 mt-6">
          We do not store your password. Authentication is handled securely by
          Google.
        </p>
      </div>
    </div>
  );
}
