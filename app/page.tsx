'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LoadingSpinner from '@/components/LoadingSpinner';
import SummaryResult from '@/components/SummaryResult';
import PricingSection from '@/components/PricingSection';
import UsageBanner from '@/components/UsageBanner';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';
import { createBrowserSupabaseClient } from '@/lib/supabase';

interface SummaryData {
  videoId: string;
  videoTitle: string;
  summary: string;
  bullets: string[];
  timestamps: { time: string; text: string }[];
  remaining: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [error, setError] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [lastUrl, setLastUrl] = useState('');

  // Generate/retrieve guest fingerprint
  const getGuestFingerprint = useCallback(() => {
    if (typeof window === 'undefined') return null;
    let fp = localStorage.getItem('yt_guest_fp');
    if (!fp) {
      fp = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('yt_guest_fp', fp);
    }
    return fp;
  }, []);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_error')) {
      setError('Sign-in failed or the link expired. Please try again.');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleSummarize = async (url: string) => {
    setIsLoading(true);
    setError('');
    setSummaryData(null);
    setLastUrl(url);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          guestFingerprint: userId ? null : getGuestFingerprint(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429 && data.requiresAuth) {
          setAuthModalOpen(true);
          setError(data.error);
        } else {
          setError(data.error || 'Something went wrong');
        }
        return;
      }

      setSummaryData(data);
      setRemaining(data.remaining);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('summary-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastUrl) {
      handleSummarize(lastUrl);
    }
  };

  return (
    <div className="min-h-screen">
      <Header onAuthClick={() => setAuthModalOpen(true)} />

      <main>
        <Hero onSummarize={handleSummarize} isLoading={isLoading} />

        {/* Error display */}
        {error && !isLoading && (
          <div className="mx-auto max-w-2xl px-4 pb-8">
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/30">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && <LoadingSpinner />}

        {/* Usage banner */}
        {remaining !== null && (
          <UsageBanner
            remaining={remaining}
            limit={userId ? 5 : 2}
            isGuest={!userId}
            onAuthClick={() => setAuthModalOpen(true)}
            onUpgrade={() => {
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* Summary results */}
        {summaryData && !isLoading && (
          <div id="summary-result">
            <SummaryResult
              videoId={summaryData.videoId}
              videoTitle={summaryData.videoTitle}
              summary={summaryData.summary}
              bullets={summaryData.bullets}
              timestamps={summaryData.timestamps}
              onRegenerate={handleRegenerate}
            />
          </div>
        )}

        {/* Landing page sections (hide when showing results) */}
        {!summaryData && !isLoading && (
          <>
            <PricingSection />
          </>
        )}
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
