import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";

import { SocratifyFooter } from "../SocratifyFooter";

describe("SocratifyFooter", () => {
  describe("branding", () => {
    it("renders brand name and default logo", () => {
      render(<SocratifyFooter />);

      expect(
        screen.getByRole("heading", { name: /socratify/i })
      ).toBeInTheDocument();
      const logo = screen.getByRole("img", { name: /socratify logo/i });
      expect(logo).toHaveAttribute(
        "src",
        "https://cdn.socratify.com/socratify.logo.transparent.png"
      );
    });

    it("renders custom brand name and tagline", () => {
      render(
        <SocratifyFooter
          brandName="CustomBrand"
          brandTagline="Custom tagline text"
        />
      );

      expect(
        screen.getByRole("heading", { name: /custombrand/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Custom tagline text")).toBeInTheDocument();
    });

    it("renders custom brand logo", () => {
      render(
        <SocratifyFooter
          brandLogoUrl="https://example.com/logo.png"
          brandLogoAlt="Custom Logo"
        />
      );

      const logo = screen.getByRole("img", { name: /custom logo/i });
      expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
    });

    it("renders custom brand slot when provided", () => {
      render(
        <SocratifyFooter
          brandSlot={<div data-testid="custom-brand">Custom Brand Slot</div>}
        />
      );

      expect(screen.getByTestId("custom-brand")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /socratify/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("social links", () => {
    it("includes all default social links", () => {
      render(<SocratifyFooter />);

      expect(
        screen.getByRole("link", { name: /x \(twitter\)/i })
      ).toHaveAttribute("href", "https://x.com/socratifyai");
      expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
        "href",
        "https://www.linkedin.com/company/socratify"
      );
      expect(screen.getByRole("link", { name: /facebook/i })).toHaveAttribute(
        "href",
        "https://www.facebook.com/socratifyai"
      );
      expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute(
        "href",
        "https://www.instagram.com/socratify.ai"
      );
      expect(screen.getByRole("link", { name: /threads/i })).toHaveAttribute(
        "href",
        "https://www.threads.net/@socratify.ai"
      );
      expect(screen.getByRole("link", { name: /youtube/i })).toHaveAttribute(
        "href",
        "https://www.youtube.com/@socratify"
      );
    });

    it("renders custom social links", () => {
      const customSocialLinks = [
        {
          name: "GitHub",
          href: "https://github.com/test",
          icon: <span data-testid="github-icon">GH</span>,
        },
      ];

      render(<SocratifyFooter socialLinks={customSocialLinks} />);

      expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
        "href",
        "https://github.com/test"
      );
      expect(screen.getByTestId("github-icon")).toBeInTheDocument();
    });
  });

  describe("navigation links", () => {
    it("renders default company links", () => {
      render(<SocratifyFooter />);

      expect(screen.getByRole("link", { name: /blog/i })).toHaveAttribute(
        "href",
        "/blog"
      );
      expect(screen.getByRole("link", { name: /mission/i })).toHaveAttribute(
        "href",
        "/manifesto"
      );
    });

    it("renders default legal links", () => {
      render(<SocratifyFooter />);

      expect(
        screen.getByRole("link", { name: /terms & conditions/i })
      ).toHaveAttribute("href", "/terms");
      expect(
        screen.getByRole("link", { name: /privacy policy/i })
      ).toHaveAttribute("href", "/privacy");
    });

    it("renders custom company and legal links", () => {
      const customCompanyLinks = [{ name: "Careers", href: "/careers" }];
      const customLegalLinks = [{ name: "Cookie Policy", href: "/cookies" }];

      render(
        <SocratifyFooter
          companyLinks={customCompanyLinks}
          legalLinks={customLegalLinks}
        />
      );

      expect(screen.getByRole("link", { name: /careers/i })).toHaveAttribute(
        "href",
        "/careers"
      );
      expect(
        screen.getByRole("link", { name: /cookie policy/i })
      ).toHaveAttribute("href", "/cookies");
    });
  });

  describe("theme styling", () => {
    it("respects light theme styling", () => {
      const { container } = render(<SocratifyFooter theme="light" />);
      const footer = container.querySelector("footer");
      expect(footer).toHaveClass("bg-background");
      expect(footer).toHaveClass("text-foreground");
    });

    it("auto-detects dark theme when document has dark class", async () => {
      // Simulate dark mode by adding dark class to document before render
      await act(async () => {
        document.documentElement.classList.add("dark");
      });

      const { container } = render(<SocratifyFooter />);

      // Wait for useEffect to run and update state
      await waitFor(() => {
        const footer = container.querySelector("footer");
        expect(footer).toHaveClass("bg-foreground");
        expect(footer).toHaveClass("text-background");
      });

      // Cleanup
      await act(async () => {
        document.documentElement.classList.remove("dark");
      });
    });
  });

  describe("subscription form", () => {
    it("hides subscription form by default", () => {
      render(<SocratifyFooter />);
      expect(
        screen.queryByPlaceholderText(/email address/i)
      ).not.toBeInTheDocument();
    });

    it("shows subscription form when enabled", () => {
      render(<SocratifyFooter enableSubscribe />);
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign up/i })
      ).toBeInTheDocument();
    });

    it("renders custom subscription text", () => {
      render(
        <SocratifyFooter
          enableSubscribe
          subscribeCta="Join our newsletter"
          subscribeDescription="Get weekly updates"
          subscribeButtonLabel="Subscribe"
          inputPlaceholder="Enter email"
        />
      );

      expect(
        screen.getByRole("heading", { name: /join our newsletter/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Get weekly updates")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /subscribe/i })
      ).toBeInTheDocument();
    });

    it("validates email format", async () => {
      render(<SocratifyFooter enableSubscribe />);

      const input = screen.getByPlaceholderText(/email address/i);
      const form = input.closest("form") as HTMLFormElement;

      // Use an email-like format that passes browser validation but fails our regex
      fireEvent.change(input, { target: { value: "invalid" } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(
          screen.getByText(/please enter a valid email address/i)
        ).toBeInTheDocument();
      });
    });

    it("calls onSubscribe callback with valid email", async () => {
      const mockOnSubscribe = vi.fn();
      render(
        <SocratifyFooter enableSubscribe onSubscribe={mockOnSubscribe} />
      );

      const input = screen.getByPlaceholderText(/email address/i);
      const button = screen.getByRole("button", { name: /sign up/i });

      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnSubscribe).toHaveBeenCalledWith("test@example.com");
      });
    });

    it("shows thank you message after successful subscription", async () => {
      render(<SocratifyFooter enableSubscribe />);

      const input = screen.getByPlaceholderText(/email address/i);
      const button = screen.getByRole("button", { name: /sign up/i });

      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/you're on the list!/i)).toBeInTheDocument();
      });
    });
  });

  describe("contact and copyright", () => {
    it("renders default contact email", () => {
      render(<SocratifyFooter />);

      expect(
        screen.getByRole("link", { name: /hello@socratify\.com/i })
      ).toHaveAttribute("href", "mailto:hello@socratify.com");
    });

    it("renders custom contact email", () => {
      render(<SocratifyFooter contactEmail="support@example.com" />);

      expect(
        screen.getByRole("link", { name: /support@example\.com/i })
      ).toHaveAttribute("href", "mailto:support@example.com");
    });

    it("renders copyright with current year", () => {
      render(<SocratifyFooter />);

      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(new RegExp(`${currentYear}.*socratify ai`, "i"))
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has proper footer landmark", () => {
      render(<SocratifyFooter />);
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("social links have aria-labels", () => {
      render(<SocratifyFooter />);

      const socialLinks = [
        "X (Twitter)",
        "LinkedIn",
        "Facebook",
        "Instagram",
        "Threads",
        "YouTube",
      ];

      socialLinks.forEach((name) => {
        expect(screen.getByRole("link", { name })).toBeInTheDocument();
      });
    });
  });

  describe("custom className", () => {
    it("applies custom className to footer", () => {
      const { container } = render(
        <SocratifyFooter className="custom-footer-class" />
      );
      const footer = container.querySelector("footer");
      expect(footer).toHaveClass("custom-footer-class");
    });
  });
});
