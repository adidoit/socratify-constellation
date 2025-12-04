import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Convert the file to a base64 data URL
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64Image = buffer.toString('base64');
  const dataUrl = `data:${file.type};base64,${base64Image}`;

  // Check for API key (using GEMINI_API_KEY per repo convention)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Call Gemini 2.0 Flash with the image using streaming
  const gemini = createGoogleGenerativeAI({ apiKey });
  const result = streamText({
    model: gemini('gemini-2.0-flash'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Critique this system architecture diagram like John Carmack or Werner Vogels would.

Be brutally direct. No fluff. No filler words. Every sentence must add value.

Format:
- **What works**: 2-3 bullet points max
- **What's broken**: List the real problems. Be specific.
- **Fix it**: Concrete changes. No hand-waving.

Short. Sharp. Technical. Skip the pleasantries.`,
          },
          {
            type: 'image',
            image: dataUrl,
          },
        ],
      },
    ],
  });

  return result.toTextStreamResponse();
}
