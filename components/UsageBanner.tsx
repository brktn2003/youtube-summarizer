'use client';

interface UsageBannerProps {
  remaining: number;
  limit: number;
  isGuest: boolean;
  onAuthClick: () => void;
  onUpgrade: () => void;
}

export default function UsageBanner({
  remaining,
  limit,
  isGuest,
  onAuthClick,
  onUpgrade,
}: UsageBannerProps) {
  if (remaining > limit * 0.5) return null; // Only show when usage is getting low

  const percentage = ((limit - remaining) / limit) * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 dark:border-amber-800/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {remaining === 0
                  ? 'You\'ve reached your summary limit'
                  : `${remaining} of ${limit} summaries remaining${isGuest ? ' (guest)' : ' today'}`}
              </p>
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                {isGuest
                  ? 'Sign in for 5 free summaries per day'
                  : 'Upgrade to Pro for unlimited summaries'}
              </p>
            </div>
          </div>

          <button
            onClick={isGuest ? onAuthClick : onUpgrade}
            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
          >
            {isGuest ? 'Sign In Free' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-800/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
