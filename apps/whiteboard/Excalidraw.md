# Excalidraw Integration Documentation

This document details how we integrated Excalidraw into our Next.js 15 whiteboard application, including configuration, customization, and programmatic element creation.

## Table of Contents
1. [Installation](#installation)
2. [Next.js Integration](#nextjs-integration)
3. [UI Customization](#ui-customization)
4. [Programmatic Element Creation](#programmatic-element-creation)
5. [Export Functionality](#export-functionality)
6. [Limitations & Gotchas](#limitations--gotchas)

---

## Installation

```bash
npm install @excalidraw/excalidraw
```

**Version used:** `^0.18.0`

### Required Imports

```typescript
import { exportToBlob, convertToExcalidrawElements } from '@excalidraw/excalidraw';
```

Also need to import the CSS in your layout:
```typescript
// app/layout.tsx
import "@excalidraw/excalidraw/index.css";
```

---

## Next.js Integration

### Challenge: Server-Side Rendering (SSR)

Excalidraw uses DOM APIs that don't exist during server-side rendering. This causes errors in Next.js App Router.

### Solution: Dynamic Import with SSR Disabled

**File:** `app/components/ExcalidrawBoard.tsx`

```typescript
'use client';

import dynamic from 'next/dynamic';

// Dynamic import - disable SSR for Excalidraw
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

export default function ExcalidrawBoard() {
  // Component must be a Client Component ('use client' directive)
  // ...
}
```

**Key Points:**
- Component MUST have `'use client'` directive
- Use `dynamic` import from `next/dynamic`
- Set `{ ssr: false }` to disable server-side rendering
- Import the named export `.Excalidraw` from the module

### Page-Level Integration

**File:** `app/page.tsx`

```typescript
'use client';

import dynamic from 'next/dynamic';

const ExcalidrawBoard = dynamic(
  () => import('./components/ExcalidrawBoard'),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-medium mb-3">Excalidraw Whiteboard</h1>
      <ExcalidrawBoard />
    </main>
  );
}
```

---

## UI Customization

### UIOptions Configuration

The `UIOptions` prop controls which UI elements are visible. We disabled most canvas actions to keep the interface simple.

```typescript
const UIOptions = React.useMemo(
  () => ({
    canvasActions: {
      changeViewBackgroundColor: false,  // Hide background color picker
      clearCanvas: true,                 // Keep clear canvas button
      loadScene: false,                  // Hide load scene
      saveToActiveFile: false,           // Hide save to file
      toggleTheme: false,                // Hide theme toggle
      saveAsImage: false,                // Hide save as image (we use custom button)
      export: false as const,            // Hide export menu
    },
  }),
  []
);

// Pass to Excalidraw component
<Excalidraw UIOptions={UIOptions} />
```

**Note:** The `export` option requires `false as const` to satisfy TypeScript types.

### Toolbar Customization via CSS

Excalidraw doesn't provide an official API to hide individual toolbar tools. We use CSS to hide unwanted tools by targeting their `title` attributes.

```typescript
<style dangerouslySetInnerHTML={{
  __html: `
    /* Hide tools not needed for interview prep */
    /* Keep: Selection, Rectangle, Ellipse, Arrow, Line, Draw, Text, Eraser */
    [title*="Diamond"],
    [title*="Hand (panning tool)"],
    [title*="Insert image"],
    [title*="More tools"],
    [title*="Library"] {
      display: none !important;
    }
  `
}} />
```

**Available Tools After Filtering:**
- ✅ Selection (move/resize elements)
- ✅ Rectangle (boxes for components/services)
- ✅ Ellipse (actors, cloud services, databases)
- ✅ Arrow (directed connections/data flow)
- ✅ Line (simple connections, dividers)
- ✅ Draw (freehand pencil)
- ✅ Text (labels)
- ✅ Eraser (delete elements)

**Limitations:**
- CSS customization is unofficial and may break with updates
- Tool options panel (stroke width, opacity, etc.) cannot be reliably hidden
- Only the main toolbar can be customized this way

---

## Programmatic Element Creation

### Skeleton API

Excalidraw provides a `convertToExcalidrawElements()` function to create elements programmatically with simplified syntax.

#### Basic Usage

```typescript
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';

const createExampleArchitecture = () => {
  return convertToExcalidrawElements([
    // Text element
    {
      type: "text",
      x: 200,
      y: 50,
      text: "System Architecture",
      fontSize: 24,
      fontFamily: 1,
    },

    // Rectangle (service/component)
    {
      type: "rectangle",
      x: 50,
      y: 150,
      width: 140,
      height: 70,
      backgroundColor: "#a5d8ff",
      label: { text: "API Server" },
    },

    // Another rectangle
    {
      type: "rectangle",
      x: 250,
      y: 150,
      width: 140,
      height: 70,
      backgroundColor: "#ffd8a8",
      label: { text: "Database" },
    },

    // Arrow connecting them
    {
      type: "arrow",
      x: 190,
      y: 185,
      points: [[0, 0], [60, 0]],
    },
  ]);
};
```

#### Element Types

| Type | Description | Required Props |
|------|-------------|----------------|
| `rectangle` | Box/component | `type`, `x`, `y`, `width`, `height` |
| `ellipse` | Circle/oval | `type`, `x`, `y`, `width`, `height` |
| `diamond` | Diamond shape | `type`, `x`, `y`, `width`, `height` |
| `arrow` | Arrow/connection | `type`, `x`, `y`, `points` |
| `line` | Simple line | `type`, `x`, `y`, `points` |
| `text` | Text label | `type`, `x`, `y`, `text` |

#### Common Styling Properties

```typescript
{
  backgroundColor: "#a5d8ff",    // Fill color (hex)
  strokeColor: "#000000",        // Border color (hex)
  strokeWidth: 1,                // Border thickness (1-4)
  opacity: 100,                  // Transparency (0-100)
  roughness: 1,                  // Hand-drawn effect (0-2)
  fontSize: 20,                  // Text size (text only)
  fontFamily: 1,                 // Font (1=Virgil, 2=Helvetica, 3=Cascadia)
  label: { text: "Label" },      // Label inside shape
}
```

#### Arrow Points

Arrows use relative coordinates from the starting position:

```typescript
{
  type: "arrow",
  x: 100,      // Start X
  y: 100,      // Start Y
  points: [
    [0, 0],    // Start point (relative to x, y)
    [100, 0],  // End point (100px right, 0px down)
  ],
}
```

### Loading Elements into Canvas

Use the `excalidrawAPI` to update the scene:

```typescript
const apiRef = React.useRef<any>(null);

const handleLoadExample = () => {
  const exampleElements = createExampleArchitecture();

  if (apiRef.current) {
    apiRef.current.updateScene({
      elements: exampleElements,
      appState: {
        viewBackgroundColor: "#ffffff",
      },
    });
  }
};

// In render
<Excalidraw
  excalidrawAPI={(api) => (apiRef.current = api)}
  // ... other props
/>
```

---

## Export Functionality

### Exporting to PNG

Use the `exportToBlob()` function to convert the canvas to an image.

```typescript
import { exportToBlob } from '@excalidraw/excalidraw';

const handleDownload = async () => {
  // Export canvas to PNG blob
  const blob = await exportToBlob({
    elements: elements as any,
    appState,
    files,
    mimeType: 'image/png',
    quality: 1,                    // 0-1 (1 = highest quality)
    getDimensions: () => ({
      width: 1920,                 // Output width
      height: 1080,                // Output height
      scale: 2                     // 2x for retina displays
    }),
  });

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `whiteboard-${Date.now()}.png`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Sending to API

Convert blob to FormData for API uploads:

```typescript
const handleUpload = async () => {
  const blob = await exportToBlob({
    elements: elements as any,
    appState,
    files,
    mimeType: 'image/png',
    quality: 1,
    getDimensions: () => ({ width: 1920, height: 1080, scale: 2 }),
  });

  const formData = new FormData();
  formData.append('file', blob, `whiteboard-${Date.now()}.png`);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
};
```

### Converting to Base64

For sending images to AI APIs (like Gemini):

```typescript
const blob = await exportToBlob({ /* ... */ });
const bytes = await blob.arrayBuffer();
const buffer = Buffer.from(bytes);
const base64Image = buffer.toString('base64');
const dataUrl = `data:image/png;base64,${base64Image}`;

// Use dataUrl with vision AI models
```

---

## Limitations & Gotchas

### ❌ What You Can't Customize

1. **Tool Options Panel**: Cannot reliably hide individual options (Background, Stroke Width, Opacity, Layers)
2. **Keyboard Shortcuts**: Cannot disable or customize built-in shortcuts
3. **Context Menus**: Right-click menus cannot be customized
4. **Mobile Touch Gestures**: Limited control over touch interactions

### ⚠️ Known Issues

1. **SSR Errors**: Always use `ssr: false` - Excalidraw requires DOM APIs
2. **Type Complexity**: Use `any` types for elements to avoid deep type imports
3. **CSS Brittleness**: Toolbar hiding via CSS may break with Excalidraw updates
4. **Performance**: Large canvases (100+ elements) may lag on mobile devices

### ✅ Best Practices

1. **State Management**: Track `elements`, `appState`, and `files` in state
   ```typescript
   const [elements, setElements] = React.useState<readonly any[]>([]);
   const [appState, setAppState] = React.useState<any>({});
   const [files, setFiles] = React.useState<any>({});

   <Excalidraw
     onChange={(els, app, fs) => {
       setElements(els);
       setAppState(app);
       setFiles(fs);
     }}
   />
   ```

2. **API Reference**: Store in useRef, not state
   ```typescript
   const apiRef = React.useRef<any>(null);

   <Excalidraw excalidrawAPI={(api) => (apiRef.current = api)} />
   ```

3. **Memoization**: Wrap UIOptions in useMemo
   ```typescript
   const UIOptions = React.useMemo(() => ({ /* config */ }), []);
   ```

4. **Error Handling**: Always check if API ref exists before calling methods
   ```typescript
   if (apiRef.current) {
     apiRef.current.updateScene({ /* ... */ });
   }
   ```

---

## Official Documentation

- **Excalidraw API**: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api
- **Skeleton API**: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/excalidraw-element-skeleton
- **initialData**: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/initialdata
- **Props**: https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props

---

## Example: Complete Component

```typescript
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { exportToBlob, convertToExcalidrawElements } from '@excalidraw/excalidraw';

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

export default function ExcalidrawBoard() {
  const apiRef = React.useRef<any>(null);
  const [elements, setElements] = React.useState<readonly any[]>([]);
  const [appState, setAppState] = React.useState<any>({});
  const [files, setFiles] = React.useState<any>({});

  const UIOptions = React.useMemo(
    () => ({
      canvasActions: {
        changeViewBackgroundColor: false,
        clearCanvas: true,
        loadScene: false,
        saveToActiveFile: false,
        toggleTheme: false,
        saveAsImage: false,
        export: false as const,
      },
    }),
    []
  );

  const loadExample = () => {
    const exampleElements = convertToExcalidrawElements([
      { type: "rectangle", x: 100, y: 100, width: 200, height: 100 },
      { type: "text", x: 150, y: 130, text: "Hello World!" },
    ]);

    if (apiRef.current) {
      apiRef.current.updateScene({ elements: exampleElements });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          [title*="Diamond"],
          [title*="Insert image"],
          [title*="Hand (panning tool)"],
          [title*="More tools"],
          [title*="Library"] {
            display: none !important;
          }
        `
      }} />

      <button onClick={loadExample}>Load Example</button>

      <Excalidraw
        excalidrawAPI={(api) => (apiRef.current = api)}
        onChange={(els, app, fs) => {
          setElements(els);
          setAppState(app);
          setFiles(fs);
        }}
        UIOptions={UIOptions}
        theme="light"
      />
    </>
  );
}
```

---

## Summary

**What Works Well:**
- ✅ Dynamic import with SSR disabled
- ✅ UIOptions for hiding canvas actions
- ✅ Skeleton API for programmatic elements
- ✅ Export to PNG/blob
- ✅ CSS-based toolbar filtering

**What's Challenging:**
- ⚠️ TypeScript types (use `any` for simplicity)
- ⚠️ CSS customization is unofficial
- ⚠️ Limited control over tool options panel
- ⚠️ No official API for granular UI control

**Recommendation:**
Excalidraw is excellent for our use case (interview whiteboard). Accept the limitations around UI customization and focus on the core drawing experience, which is robust and well-designed.
