'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

const GRID_SIZE = 24;
const ALLOWED_TYPES = new Set(['rectangle', 'arrow', 'text']);

type SanitizedElement = any;
type AppState = Record<string, any>;

const DEFAULT_APP_STATE: AppState = {
  gridModeEnabled: true,
  gridSize: GRID_SIZE,
  viewBackgroundColor: '#fbfbfb',
};

const sanitizeNumber = (value: number) => {
  if (Number.isFinite(value)) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }
  return 0;
};

const sanitizeArrowPoints = (points: any[] | undefined) => {
  if (!points || points.length === 0) {
    return [
      [0, 0],
      [0, GRID_SIZE * 4],
    ];
  }

  const start = points[0];
  const end = points[points.length - 1];
  return [
    Array.isArray(start) ? [...start] : [0, 0],
    Array.isArray(end) ? [...end] : [0, GRID_SIZE * 4],
  ];
};

const sanitizeElements = (rawElements: readonly any[]): SanitizedElement[] => {
  return rawElements
    .filter((el) => ALLOWED_TYPES.has(el.type))
    .map((el) => {
      const clone: SanitizedElement = { ...el };

      if (typeof clone.x === 'number') {
        clone.x = sanitizeNumber(clone.x);
      }
      if (typeof clone.y === 'number') {
        clone.y = sanitizeNumber(clone.y);
      }
      clone.angle = 0;
      clone.strokeColor = '#1f2937';
      clone.strokeStyle = 'solid';
      clone.strokeWidth = 1;
      clone.roughness = 1;

      if (clone.type === 'rectangle') {
        if (typeof clone.width === 'number') {
          clone.width = Math.max(GRID_SIZE * 6, sanitizeNumber(clone.width));
        }
        if (typeof clone.height === 'number') {
          clone.height = Math.max(GRID_SIZE * 3, sanitizeNumber(clone.height));
        }
        clone.backgroundColor = '#ffffff';
      }

      if (clone.type === 'text') {
        clone.textAlign = 'center';
        clone.verticalAlign = 'middle';
        clone.fontSize = Math.max(18, clone.fontSize || 18);
        clone.lineHeight = clone.lineHeight || 1.2;
      }

      if (clone.type === 'arrow') {
        clone.points = sanitizeArrowPoints(clone.points);
        clone.startArrowhead = null;
        clone.endArrowhead = 'arrow';
        clone.roundness = { type: 2 };
        clone.fillStyle = 'hachure';
        clone.backgroundColor = '#ffffff';
      }

      const existingCustomData = clone.customData ?? {};

      clone.customData = {
        ...existingCustomData,
        kind:
          clone.type === 'arrow'
            ? 'edge'
            : clone.type === 'text'
            ? 'label'
            : 'node',
        id: existingCustomData.id || clone.id,
      };

      return clone;
    });
};

const sanitizeAppState = (state: AppState): AppState => ({
  ...state,
  ...DEFAULT_APP_STATE,
});

const createInitialTreeScene = () =>
  sanitizeElements(
    convertToExcalidrawElements([
      {
        type: 'text',
        x: 140,
        y: 40,
        text: 'Issue Tree Workspace',
        fontSize: 26,
        fontFamily: 1,
      },
      {
        type: 'text',
        x: 140,
        y: 80,
        text: 'Start with the root issue, then break it down with children.',
        fontSize: 16,
        fontFamily: 1,
      },
      {
        type: 'rectangle',
        x: 140,
        y: 150,
        width: 260,
        height: 120,
      },
      {
        type: 'text',
        x: 160,
        y: 188,
        text: 'Root Issue',
        fontSize: 20,
        fontFamily: 1,
      },
    ])
  );

const serializeScene = (elements: readonly any[], appState: AppState) =>
  JSON.stringify({
    elements,
    appState,
  });

export default function IssueTreeBoard() {
  const apiRef = React.useRef<any>(null);
  const suppressNextChange = React.useRef(false);
  const lastSerialized = React.useRef<string>('');
  const [elements, setElements] = React.useState<readonly SanitizedElement[]>([]);
  const [appState, setAppState] = React.useState<AppState>(DEFAULT_APP_STATE);
  const [files, setFiles] = React.useState<Record<string, any>>({});
  const initialized = React.useRef(false);

  const seedScene = React.useCallback(() => {
    const starterElements = createInitialTreeScene();
    const starterApp = { ...DEFAULT_APP_STATE };
    setElements(starterElements);
    setAppState(starterApp);
    lastSerialized.current = serializeScene(starterElements, starterApp);
    suppressNextChange.current = true;
    apiRef.current?.updateScene({
      elements: starterElements as any,
      appState: starterApp,
      commitToHistory: true,
    });
  }, []);

  const handleReady = React.useCallback(
    (api: any) => {
      apiRef.current = api;
      if (!initialized.current) {
        initialized.current = true;
        seedScene();
      }
    },
    [seedScene]
  );

  const handleChange = React.useCallback(
    (nextElements: readonly any[], nextAppState: AppState, nextFiles: Record<string, any>) => {
      if (suppressNextChange.current) {
        suppressNextChange.current = false;
        setElements(nextElements);
        setAppState(nextAppState);
        setFiles(nextFiles);
        lastSerialized.current = serializeScene(nextElements, nextAppState);
        return;
      }

      const sanitizedElements = sanitizeElements(nextElements);
      const sanitizedAppState = sanitizeAppState(nextAppState);
      setFiles(nextFiles);

      const serialized = serializeScene(sanitizedElements, sanitizedAppState);
      const shouldUpdateScene = serialized !== lastSerialized.current;

      setElements(sanitizedElements);
      setAppState(sanitizedAppState);

      if (shouldUpdateScene) {
        lastSerialized.current = serialized;
        suppressNextChange.current = true;
        apiRef.current?.updateScene({
          elements: sanitizedElements as any,
          appState: sanitizedAppState,
          commitToHistory: false,
        });
      }
    },
    []
  );

  const handleReset = React.useCallback(() => {
    seedScene();
  }, [seedScene]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          [title*="Diamond"],
          [title*="Ellipse"],
          [title*="Line"],
          [title*="Draw"],
          [title*="Insert image"],
          [title*="More tools"],
          [title*="Library"],
          [title*="Eraser"],
          [title*="Hand"] {
            display: none !important;
          }
          `,
        }}
      />
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-4">
            <button
              onClick={handleReset}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              ♻️ Reset Canvas
            </button>
            <span className="ml-auto text-xs font-medium uppercase tracking-wide text-gray-400">
              Grid {GRID_SIZE}px • Rectangles + Arrows + Text
            </span>
          </div>

          <div className="h-[75vh]">
            <Excalidraw
              excalidrawAPI={handleReady}
              onChange={handleChange}
              UIOptions={{
                canvasActions: {
                  changeViewBackgroundColor: false,
                  clearCanvas: true,
                  export: false,
                  loadScene: false,
                  saveAsImage: false,
                  saveToActiveFile: false,
                  toggleTheme: false,
                },
              }}
              name="Issue Tree Canvas"
              theme="light"
              initialData={{
                elements,
                appState,
                files,
              }}
            />
          </div>
        </div>

        <aside className="w-full shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-6 text-sm leading-6 text-gray-700 lg:w-80">
          <h2 className="text-base font-semibold text-gray-900">How to structure your tree</h2>
          <ul className="mt-3 space-y-2">
            <li>1. Keep exactly one root issue on the left.</li>
            <li>2. Break branches into MECE children using rectangles.</li>
            <li>3. Use arrows in the left-to-right direction only.</li>
            <li>4. Snap follows a {GRID_SIZE}px grid so siblings stay aligned.</li>
            <li>5. Collapse &amp; scoring will arrive soon — focus on structure.</li>
          </ul>
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500">
            Looking for the classic architecture whiteboard?{' '}
            <a href="/whiteboard" className="font-medium text-blue-600 hover:text-blue-700">
              Switch back here.
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
