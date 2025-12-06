"use client";

import * as React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

import { cn } from "../cn";

export type FooterLink = {
  name: string;
  href: string;
};

export type FooterSocialLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

export type SocratifyFooterProps = {
  brandName?: string;
  brandHref?: string;
  brandTagline?: string;
  brandLogoUrl?: string;
  brandLogoAlt?: string;
  contactEmail?: string;
  companyLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  socialLinks?: FooterSocialLink[];
  theme?: "dark" | "light";
  enableSubscribe?: boolean;
  subscribeCta?: string;
  subscribeDescription?: string;
  subscribeButtonLabel?: string;
  subscribeSubmittingLabel?: string;
  subscribeSuccessTitle?: string;
  subscriptionErrorMessage?: string;
  inputPlaceholder?: string;
  thankYouIcon?: React.ReactNode;
  brandSlot?: React.ReactNode;
  className?: string;
  onSubscribe?: (email: string) => Promise<void> | void;
};

const defaultSocialLinks: FooterSocialLink[] = [
  {
    name: "X (Twitter)",
    href: "https://x.com/socratifyai",
    icon: <Twitter className="h-5 w-5" />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/socratify",
    icon: <Linkedin className="h-5 w-5" />,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/socratifyai",
    icon: <Facebook className="h-5 w-5" />,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/socratify.ai",
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    name: "Threads",
    href: "https://www.threads.net/@socratify.ai",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        role="img"
        aria-label="Threads"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@socratify",
    icon: <Youtube className="h-5 w-5" />,
  },
];

const defaultCompanyLinks: FooterLink[] = [
  { name: "Blog", href: "/blog" },
  { name: "Mission", href: "/manifesto" },
];

const defaultLegalLinks: FooterLink[] = [
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
];

const DEFAULT_LOGO_URL = "https://cdn.socratify.com/socratify.logo.transparent.png";

export function SocratifyFooter({
  brandName = "socratify",
  brandHref = "/",
  brandTagline = "AI products that upgrade humans",
  brandLogoUrl = DEFAULT_LOGO_URL,
  brandLogoAlt = "Socratify logo",
  contactEmail = "hello@socratify.com",
  socialLinks = defaultSocialLinks,
  companyLinks = defaultCompanyLinks,
  legalLinks = defaultLegalLinks,
  theme = "dark",
  enableSubscribe = false,
  subscribeCta = "Keep up with us.",
  subscribeDescription = "Get news, blog posts, and more in your inbox.",
  subscribeButtonLabel = "Sign Up",
  subscribeSubmittingLabel = "Signing Up...",
  subscribeSuccessTitle = "You're on the list!",
  subscriptionErrorMessage = "Failed to subscribe. Please try again later.",
  inputPlaceholder = "Email Address*",
  thankYouIcon = "✨",
  brandSlot,
  className,
  onSubscribe,
}: SocratifyFooterProps) {
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(theme);
  const [showThankYou, setShowThankYou] = React.useState(false);

  // Auto-detect theme from document if theme prop is not explicitly set or is "auto"
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setResolvedTheme(isDark ? "dark" : "light");
    };

    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          detectTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const isLight = resolvedTheme === "light";
  const [emailError, setEmailError] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const year = React.useMemo(() => new Date().getFullYear(), []);

  const themeStyles = {
    root: isLight
      ? "bg-background text-foreground border-border/20"
      : "bg-foreground text-background border-background/10",
    tagline: isLight ? "text-muted-foreground" : "text-slate-200/60",
    sectionHeading: isLight ? "text-muted-foreground" : "text-slate-200",
    link: isLight
      ? "text-muted-foreground hover:text-primary"
      : "text-background/70 hover:text-primary",
    socialLink: isLight
      ? "text-foreground/80 hover:text-primary"
      : "text-background hover:text-primary",
    socialBg: isLight
      ? "bg-muted/80 border border-border"
      : "bg-background/10 border border-background/10",
    divider: isLight ? "border-border/20" : "border-muted-foreground/10",
    muted: "text-muted-foreground",
    inputBg: isLight ? "bg-muted" : "bg-background/10",
    inputBorder: isLight ? "border-border" : "border-background/20",
    inputText: isLight ? "text-foreground" : "text-background",
    inputPlaceholder: isLight
      ? "placeholder:text-muted-foreground"
      : "placeholder:text-background/70",
    thankYouBg: isLight ? "bg-muted/70" : "bg-background/10",
  };

  return (
    <footer
      className={cn(
        "border-t w-full",
        themeStyles.root,
        className
      )}
    >
      <div className="w-full max-w-5xl mx-auto px-6 py-12 sm:px-8 sm:py-16">
        {/* Main footer content */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          {/* Brand section */}
          <div className="flex flex-col gap-6 lg:max-w-xs">
            {brandSlot ?? (
              <a href={brandHref} className="inline-block">
                <div className="flex items-center gap-3">
                  <img
                    src={brandLogoUrl}
                    alt={brandLogoAlt}
                    className="h-9 w-9 rounded-lg border border-border bg-background object-contain"
                  />
                  <h2 className="text-2xl font-extrabold lowercase font-display">
                    {brandName}
                  </h2>
                </div>
                <p
                  className={cn(
                    "mt-2 text-sm leading-relaxed",
                    themeStyles.tagline
                  )}
                >
                  {brandTagline}
                </p>
              </a>
            )}
            {/* Social links - responsive wrap */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={cn(
                    "transition-colors duration-200",
                    themeStyles.socialLink
                  )}
                  aria-label={social.name}
                >
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-full",
                      themeStyles.socialBg
                    )}
                  >
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Links sections */}
          <div className="flex flex-wrap gap-12 sm:gap-16">
            <div>
              <h3
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-wider",
                  themeStyles.sectionHeading
                )}
              >
                Company
              </h3>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className={cn(
                        "text-sm transition-colors duration-200",
                        themeStyles.link
                      )}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-wider",
                  themeStyles.sectionHeading
                )}
              >
                Legal
              </h3>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className={cn(
                        "text-sm transition-colors duration-200",
                        themeStyles.link
                      )}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Subscribe section */}
        {enableSubscribe && (
          <div className="mt-12 pt-8 border-t border-inherit">
            <div className="max-w-xl">
              <h2 className="mb-2 text-lg font-bold">{subscribeCta}</h2>
              <p className={cn("mb-6 text-sm", themeStyles.tagline)}>
                {subscribeDescription}
              </p>

              {!showThankYou ? (
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const form = event.target as HTMLFormElement;
                    const email = (
                      form.elements.namedItem("email") as HTMLInputElement
                    ).value;

                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                      setEmailError("Please enter a valid email address");
                      return;
                    }

                    setEmailError("");
                    setIsSubmitting(true);

                    if (!onSubscribe) {
                      setShowThankYou(true);
                      form.reset();
                      setIsSubmitting(false);
                      return;
                    }

                    try {
                      await onSubscribe(email);
                      setShowThankYou(true);
                      form.reset();
                    } catch (error) {
                      console.error("Error sending email:", error);
                      setEmailError(subscriptionErrorMessage);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex flex-col gap-3 sm:flex-row"
                >
                  <div className="flex-1">
                    <input
                      type="email"
                      name="email"
                      placeholder={inputPlaceholder}
                      className={cn(
                        "w-full rounded-lg border px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
                        themeStyles.inputBg,
                        themeStyles.inputPlaceholder,
                        themeStyles.inputText,
                        emailError ? "border-red-400" : themeStyles.inputBorder
                      )}
                      required
                      disabled={isSubmitting}
                    />
                    {emailError && (
                      <span className="mt-1 block text-left text-xs text-red-400">
                        {emailError}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? subscribeSubmittingLabel
                      : subscribeButtonLabel}
                  </button>
                </form>
              ) : (
                <div
                  className={cn(
                    "rounded-lg p-4",
                    themeStyles.thankYouBg
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{thankYouIcon}</span>
                    <h3 className="text-sm font-bold">
                      {subscribeSuccessTitle}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        className={cn(
          "border-t",
          themeStyles.divider
        )}
      >
        <div className="w-full max-w-5xl mx-auto px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className={cn("text-xs", themeStyles.muted)}>
              &copy; {year} Socratify AI Inc. All rights reserved.
            </p>
            <p className={cn("text-xs", themeStyles.muted)}>
              Questions?{" "}
              <a href={`mailto:${contactEmail}`} className="underline hover:no-underline">
                {contactEmail}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
