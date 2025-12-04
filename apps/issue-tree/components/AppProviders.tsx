"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>;
}
