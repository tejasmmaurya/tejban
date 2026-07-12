import React from 'react';

export default function GoogleSignInButton({ onClick, isLoading = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        // Clean loading spinner if you need to show an active loading state
        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        // Official Google G Logo SVG with standardized colors
        <svg className="h-5 w-5" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.645 1.055 14.982 0 12 0 7.355 0 3.327 2.645 1.345 6.509l3.92 3.256z"
          />
          <path
            fill="#34A853"
            d="M16.04 15.345c-1.073.718-2.4 1.146-4.04 1.146-2.736 0-5.055-1.855-5.882-4.355l-3.955 3.064C4.127 19.827 7.764 22 12 22c3.045 0 5.873-1.018 7.973-2.773l-3.936-3.882z"
          />
          <path
            fill="#4285F4"
            d="M23.545 12.291c0-.818-.073-1.609-.209-2.382H12v4.51h6.473c-.273 1.482-1.118 2.736-2.382 3.582l3.936 3.882c2.3-2.127 3.518-5.264 3.518-9.592z"
          />
          <path
            fill="#FBBC05"
            d="M6.155 12.136a6.99 6.99 0 0 1 0-2.273L2.2 6.8c-.818 1.636-1.282 3.473-1.282 5.427s.464 3.791 1.282 5.427l3.955-3.064z"
          />
        </svg>
      )}
      <span className="text-gray-700 tracking-wide font-medium">
        {isLoading ? 'Connecting...' : 'Continue with Google'}
      </span>
    </button>
  );
}