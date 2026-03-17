import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Fetch transcript for a YouTube video
 */
export async function fetchTranscript(videoId: string): Promise<{
  segments: TranscriptSegment[];
  fullText: string;
}> {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    const segments: TranscriptSegment[] = transcriptItems.map((item) => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration,
    }));

    const fullText = segments.map((s) => s.text).join(' ');

    return { segments, fullText };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch transcript: ${message}`);
  }
}

/**
 * Format seconds into HH:MM:SS or MM:SS
 */
export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Chunk transcript to stay within token limits
 * Roughly 1 token ≈ 4 characters, keeping under ~12000 tokens
 */
export function chunkTranscript(text: string, maxChars: number = 48000): string {
  if (text.length <= maxChars) return text;

  // Take first and last portions to capture intro and conclusion
  const halfMax = Math.floor(maxChars / 2);
  const firstHalf = text.slice(0, halfMax);
  const secondHalf = text.slice(-halfMax);

  return `${firstHalf}\n\n[... middle section truncated for length ...]\n\n${secondHalf}`;
}

/**
 * Fetch video title via oEmbed (no API key needed)
 */
export async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return 'YouTube Video';
    const data = await res.json();
    return data.title || 'YouTube Video';
  } catch {
    return 'YouTube Video';
  }
}
