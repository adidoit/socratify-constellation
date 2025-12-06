import { AppShell } from "@/components/AppShell";

export default function AboutPage() {
  return (
    <AppShell>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-display-lg text-center mb-4">About</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This page is coming soon.
        </p>
      </div>
    </AppShell>
  );
}
