import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AppShell } from "@/components/AppShell";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

describe("AppShell sidebar visibility", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ isSignedIn: true, user: { id: "user-1" }, isLoading: false });
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    (global as unknown as { fetch: typeof originalFetch }).fetch = originalFetch;
  });

  test("does not render sidebar on home when history is empty", async () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await act(async () => {
      render(
        <AppShell>
          <div>Content</div>
        </AppShell>
      );
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.queryByText("History")).not.toBeInTheDocument();
  });

  test("skips history fetch when signed out", async () => {
    (useAuth as jest.Mock).mockReturnValue({ isSignedIn: false, user: null, isLoading: false });
    (usePathname as jest.Mock).mockReturnValue("/");

    await act(async () => {
      render(
        <AppShell>
          <div>Content</div>
        </AppShell>
      );
    });

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
    expect(screen.queryByText("History")).not.toBeInTheDocument();
  });

  test("renders sidebar on home when history is non-empty", async () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "tree-1",
          title: "First tree",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    await act(async () => {
      render(
        <AppShell>
          <div>Content</div>
        </AppShell>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("History")).toBeInTheDocument();
    });
  });

  test("always renders sidebar on non-home routes", async () => {
    (usePathname as jest.Mock).mockReturnValue("/t/tree-1");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await act(async () => {
      render(
        <AppShell>
          <div>Content</div>
        </AppShell>
      );
    });

    // Should be visible immediately, before history is known
    expect(screen.getByText("History")).toBeInTheDocument();
  });
});
