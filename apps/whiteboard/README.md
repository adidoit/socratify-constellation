# Excalidraw Whiteboard with AI Critique

An interview prep whiteboard built with Next.js and Excalidraw, featuring AI-powered architecture critiques using Google Gemini 2.0 Flash.

## Features

- **Interactive Whiteboard**: Draw system architecture diagrams with essential tools (Selection, Rectangle, Ellipse, Arrow, Line, Draw, Text, Eraser)
- **60/40 Split Layout**: Whiteboard on the left (60%), critique panel on the right (40%)
- **Fullscreen Mode**: Expand whiteboard to full screen with ESC key or close button
- **Load Example**: Pre-built Uber delivery time prediction architecture
- **Download PNG**: Save your whiteboard as a PNG image to your computer
- **Upload PNG**: Save your whiteboard to the server (`/public/uploads/`)
- **AI Critique**: Get intelligent feedback on your architecture design from Google Gemini 2.0 Flash

## Setup (Constellation Monorepo)

1. **Install dependencies (workspace root)**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables** (root `.env.local` or app-specific):
   ```bash
   GEMINI_API_KEY=your_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   Get your API key from: https://aistudio.google.com/apikey

3. **Run the development server for this app**:
   ```bash
   pnpm dev --filter @constellation/whiteboard
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Drawing
- Use the toolbar to select drawing tools
- Create system architecture diagrams with rectangles, arrows, and text
- Draw freehand annotations with the pencil tool
- Erase elements as needed

### Getting AI Feedback
1. Draw your system architecture on the whiteboard
2. Click the **"🤖 Critique Architecture"** button
3. Wait for Gemini 2.0 Flash to analyze your design
4. View the detailed critique below the whiteboard

The AI will provide:
- Overall assessment of your architecture
- Key strengths in your design
- Areas for improvement
- Scalability concerns
- Specific actionable recommendations

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Excalidraw** for the canvas
- **AI SDK v6** with **Google Gemini 2.0 Flash**
- **Supabase** for auth/session (shared monorepo client)
- **TypeScript**
- **Tailwind CSS v4**

## Architecture

```
app/
├── components/
│   └── ExcalidrawBoard.tsx    # Main whiteboard component
├── api/
│   ├── upload/
│   │   └── route.ts           # PNG upload endpoint
│   └── critique/
│       └── route.ts           # AI critique endpoint
├── page.tsx                   # Home page
└── layout.tsx                 # Root layout

public/
└── uploads/                   # Uploaded PNG files (gitignored)
```

## API Endpoints

### POST `/api/upload`
Uploads a PNG image to the server.

**Request**: FormData with `file` field
**Response**: `{ success: true, path: string, filename: string }`

### POST `/api/critique`
Sends a PNG image to Google Gemini 2.0 Flash for architecture critique.

**Request**: FormData with `file` field
**Response**: `{ success: true, critique: string, usage: object }`

## Interview Prep Use Case

This whiteboard is designed for technical interview preparation, specifically for:
- **System Design Interviews**: Draw architecture diagrams with boxes and arrows
- **Technical Discussions**: Sketch out component relationships and data flows
- **Learning**: Get AI feedback on your architectural thinking
- **Practice**: Iterate on designs based on constructive critique

The AI critique simulates feedback you might receive from an interviewer, helping you identify:
- Missing components in your design
- Scalability bottlenecks
- Best practices you might have overlooked
- Areas where you can demonstrate deeper technical knowledge

## Development Notes

- The whiteboard uses dynamic imports with `ssr: false` to avoid SSR issues with DOM APIs
- Excalidraw's UI customization is limited - only the toolbar can be reliably customized via CSS
- The AI critique uses Gemini 2.0 Flash (`gemini-2.0-flash`) for multimodal input
- Images are exported at 1920x1080 with 2x scale for high quality

## License

MIT
