'use client';

export default function LoadingSpinner() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      {/* Animated rings */}
      <div className="relative mx-auto mb-8 h-24 w-24">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-600" style={{ animationDuration: '1.5s' }} />
        <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-indigo-500" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-4 animate-spin rounded-full border-4 border-transparent border-t-purple-400" style={{ animationDuration: '2.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455-2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455-2.456z" />
          </svg>
        </div>
      </div>

      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        Analyzing video ...
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Fetching transcript and generating your AI-powered summary
      </p>

      {/* Progress steps */}
      <div className="mx-auto mt-8 max-w-xs space-y-3 text-left text-sm">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
          <svg className="h-4 w-4 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" />
          </svg>
          Extracting video transcript...
        </div>
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" />
          </svg>
          Processing...
        </div>
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" />
          </svg>
          Formatting results...
        </div>
      </div>
    </div>
  );
}
