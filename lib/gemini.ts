import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptSegment, formatTimestamp } from './youtube';

let _genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return _genAI;
}

export interface SummaryResult {
  summary: string;
  bullets: string[];
  timestamps: { time: string; text: string }[];
}

/**
 * Generate a summary from a YouTube transcript using Gemini 2.0 Flash (or latest)
 */
export async function summarizeTranscript(
  transcript: string,
  segments: TranscriptSegment[]
): Promise<SummaryResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  // Build a timestamp context string from segments
  // We'll take ~20 key moments if multiple exist
  const timestampContext = segments
    .filter((_, i) => i % Math.max(1, Math.floor(segments.length / 20)) === 0)
    .map((s) => `[${formatTimestamp(s.offset / 1000)}] ${s.text}`)
    .join('\n');

  const prompt = `You are an expert content summarizer. Analyze the following YouTube video transcript and provide a structured summary.

TRANSCRIPT:
${transcript}

TIMESTAMPED SECTIONS (for reference):
${timestampContext}

Please provide your response in the following JSON format:
{
  "summary": "A concise 3-5 sentence summary of the video content",
  "bullets": ["Key insight 1", "Key insight 2", "...up to 10 key insights"],
  "timestamps": [{"time": "0:00", "text": "Topic discussed at this point"}, {"time": "2:30", "text": "Another key moment"}]
}

Rules:
1. Summary should capture the main theme and takeaways in 3-5 clear sentences.
2. Bullets should be 5-10 actionable or notable key insights.
3. Timestamps should highlight 3-8 important moments with their approximate times.
4. Be specific and informative, not generic.
5. Return ONLY valid JSON.`;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (error: any) {
    if (error.status === 429) {
      throw new Error('Gemini API quota exceeded or too many requests. Please wait a moment and try again.');
    }
    throw error;
  }
  const response = await result.response;
  const content = response.text();

  if (!content) {
    throw new Error('No response from Gemini');
  }

  try {
    const parsed = JSON.parse(content) as SummaryResult;
    return {
      summary: parsed.summary || 'No summary generated.',
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
      timestamps: Array.isArray(parsed.timestamps) ? parsed.timestamps : [],
    };
  } catch (err) {
    console.error('Gemini Parse Error:', err);
    throw new Error('Failed to parse AI response');
  }
}
