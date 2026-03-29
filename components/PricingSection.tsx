'use client';

const proMailto = () => {
  const addr = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '';
  const subject = encodeURIComponent('YouTube Summarizer — Pro');
  return addr ? `mailto:${addr}?subject=${subject}` : '#summarize';
};

export default function PricingSection() {
  return (
    <section className="py-16 sm:py-24" id="pricing">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
            Simple Pricing
          </div>
          <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {/* Free tier */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Free</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$0</span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Perfect for trying out the service
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {[
                '2 summaries as a guest (lifetime)',
                '5 summaries per day with a free account',
                'Bullet points and timestamp highlights',
                'Copy as plain text or Markdown',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="#summarize"
              className="mt-8 flex w-full justify-center rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Try it free
            </a>
          </div>

          {/* Pro tier */}
          <div className="relative rounded-2xl border-2 border-blue-500 bg-white p-6 shadow-xl shadow-blue-500/10 dark:bg-gray-900 sm:p-8">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-blue-500/25">
                MOST POPULAR
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pro</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">Pro</span>
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Unlimited summaries for heavy use
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {[
                'Unlimited summaries (plan flag in your profile)',
                'Summaries saved to your account',
                'Same Markdown and copy tools as Free',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={proMailto()}
              className="mt-8 flex w-full justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:brightness-110"
            >
              Request Pro access
            </a>
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL
                ? 'We will reply with next steps to enable Pro on your account.'
                : 'Set NEXT_PUBLIC_CONTACT_EMAIL for a mailto link, or scroll up to try the app.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
