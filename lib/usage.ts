import { createServerSupabaseClient } from './supabase';

const GUEST_LIMIT = 2;
const USER_DAILY_LIMIT = 5;

interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  requiresAuth: boolean;
}

/**
 * Check if a user (guest or authenticated) can make another summary request
 */
export async function checkUsageLimit(
  userId?: string | null,
  guestFingerprint?: string | null
): Promise<UsageCheckResult> {
  const supabase = createServerSupabaseClient();

  // Authenticated user
  if (userId) {
    // Check if user is on pro plan (unlimited)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();

    if (profile?.plan === 'pro') {
      return { allowed: true, remaining: 999, limit: 999, requiresAuth: false };
    }

    // Count today's usage
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());

    const used = count || 0;
    const remaining = Math.max(0, USER_DAILY_LIMIT - used);

    return {
      allowed: remaining > 0,
      remaining,
      limit: USER_DAILY_LIMIT,
      requiresAuth: false,
    };
  }

  // Guest user
  if (guestFingerprint) {
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('guest_fingerprint', guestFingerprint);

    const used = count || 0;
    const remaining = Math.max(0, GUEST_LIMIT - used);

    return {
      allowed: remaining > 0,
      remaining,
      limit: GUEST_LIMIT,
      requiresAuth: remaining <= 0,
    };
  }

  // No identity at all — allow as first-time guest
  return { allowed: true, remaining: GUEST_LIMIT, limit: GUEST_LIMIT, requiresAuth: false };
}

/**
 * Record a usage event
 */
export async function recordUsage(
  videoId: string,
  userId?: string | null,
  guestFingerprint?: string | null
): Promise<void> {
  const supabase = createServerSupabaseClient();

  await supabase.from('usage_logs').insert({
    user_id: userId || null,
    guest_fingerprint: guestFingerprint || null,
    video_id: videoId,
  });
}

/**
 * Save a summary result for a logged-in user
 */
export async function saveSummary(
  userId: string,
  videoId: string,
  videoTitle: string,
  summary: string,
  bullets: string[],
  timestamps: { time: string; text: string }[]
): Promise<void> {
  const supabase = createServerSupabaseClient();

  await supabase.from('summaries').insert({
    user_id: userId,
    video_id: videoId,
    video_title: videoTitle,
    summary,
    bullets,
    timestamps,
  });
}
