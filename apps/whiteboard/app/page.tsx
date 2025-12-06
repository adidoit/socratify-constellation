'use client';

import dynamic from 'next/dynamic';
import { SocratifyFooter } from '@constellation/ui';
import { SocratifyBranding } from './components/SocratifyBranding';

const ExcalidrawBoard = dynamic(() => import('./components/ExcalidrawBoard'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-10 lg:px-8">
          <div className="flex flex-col gap-2">
            <span className="text-label text-muted-foreground">
              Architecture Whiteboard
            </span>
            <h1 className="text-display-md text-foreground">
              System Design Canvas
            </h1>
            <p className="max-w-3xl text-body-md text-muted-foreground">
              Load the reference diagram, iterate freely, request AI critique, and export your draft as PNG.
            </p>
          </div>

          <ExcalidrawBoard />

          <SocratifyBranding variant="compact" className="self-center mt-4" />
        </div>
      </main>

      <SocratifyFooter className="mt-12" />
    </>
  );
}
