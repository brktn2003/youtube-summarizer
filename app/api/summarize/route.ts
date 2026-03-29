import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, fetchTranscript, chunkTranscript, fetchVideoTitle } from '@/lib/youtube';
import { summarizeTranscript } from '@/lib/gemini';
import { checkUsageLimit, recordUsage, saveSummary } from '@/lib/usage';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, guestFingerprint: rawGuest } = body;

    const supabaseAuth = await createSupabaseRouteHandlerClient();
    const {
      data: { user: sessionUser },
    } = await supabaseAuth.auth.getUser();
    const userId = sessionUser?.id ?? null;
    const guestFingerprint = userId ? null : rawGuest ?? null;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid YouTube URL' },
        { status: 400 }
      );
    }

    // 1. Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please paste a valid YouTube video link.' },
        { status: 400 }
      );
    }

    // 2. Check usage limits
    const usageCheck = await checkUsageLimit(userId, guestFingerprint);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.requiresAuth
            ? 'You have used all your free summaries. Please sign in to continue.'
            : 'Daily summary limit reached. Upgrade to Pro for unlimited summaries.',
          requiresAuth: usageCheck.requiresAuth,
          remaining: usageCheck.remaining,
        },
        { status: 429 }
      );
    }

    // 3. Fetch transcript
    let transcript;
    try {
      transcript = await fetchTranscript(videoId);
    } catch (error) {
      console.error('Fetch transcript error:', error);
      return NextResponse.json(
        {
          error:
            'Could not retrieve transcript for this video. The video may not have captions available.',
        },
        { status: 422 }
      );
    }

    if (!transcript.fullText || transcript.fullText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Transcript is too short or empty to generate a meaningful summary.' },
        { status: 422 }
      );
    }

    // 4. Fetch video title
    const videoTitle = await fetchVideoTitle(videoId);

    // 5. Chunk transcript if too long
    const processedTranscript = chunkTranscript(transcript.fullText);

    // 6. Summarize with Gemini
    const result = await summarizeTranscript(processedTranscript, transcript.segments);

    // 7. Record usage
    await recordUsage(videoId, userId, guestFingerprint);

    // 8. Save summary for logged-in users
    if (userId) {
      await saveSummary(
        userId,
        videoId,
        videoTitle,
        result.summary,
        result.bullets,
        result.timestamps
      );
    }

    return NextResponse.json({
      videoId,
      videoTitle,
      summary: result.summary,
      bullets: result.bullets,
      timestamps: result.timestamps,
      remaining: usageCheck.remaining - 1,
    });
  } catch (error: any) {
    console.error('Summarize API error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
