"use client";

import React from "react";

export type SocratifyBrandingVariant = "full" | "compact" | "minimal";

export type SocratifyBrandingProps = {
  /**
   * Visual variant of the branding component
   * - "full": Large card with tagline and CTA button
   * - "compact": Pill-shaped inline badge
   * - "minimal": Simple text link
   */
  variant?: SocratifyBrandingVariant;

  /**
   * UTM source for analytics tracking (e.g., "issuetree", "fermiproblem")
   */
  utmSource: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * (Deprecated) Previously toggled the arrow icon. Kept for backward compat.
   */
  showArrow?: boolean;

  /**
   * Path to the Socratify logo in your public folder
   * @default "/socratify.logo.transparent.png"
   */
  logoPath?: string;

  /**
   * Custom tagline text (only shown in "full" variant)
   * @default "Sharpen how you think and speak"
   */
  tagline?: string;

  /**
   * Use Next.js Image component for optimized images
   * Set to true if you have next/image available and the logo in your public folder
   * @default false
   */
  useNextImage?: boolean;

  /**
   * Next.js Image component - pass it from your project to avoid bundling next
   * Required if useNextImage is true
   * @example import Image from "next/image"; <SocratifyBranding NextImage={Image} useNextImage />
   */
  NextImage?: React.ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>;
};

const SOCRATIFY_BASE_URL = "https://socratify.com";
const DEFAULT_LOGO_PATH = "/socratify.logo.transparent.png";
const DEFAULT_TAGLINE = "Sharpen how you think and speak";

/**
 * Socratify branding component for sponsored placements
 *
 * @example
 * // Minimal usage
 * <SocratifyBranding utmSource="myapp" />
 *
 * @example
 * // With Next.js Image optimization
 * import Image from "next/image";
 * <SocratifyBranding utmSource="myapp" useNextImage NextImage={Image} />
 *
 * @example
 * // Compact pill variant
 * <SocratifyBranding utmSource="myapp" variant="compact" />
 */
export const SocratifyBranding: React.FC<SocratifyBrandingProps> = ({
  variant = "full",
  utmSource,
  className = "",
  showArrow: _showArrow = false,
  logoPath = DEFAULT_LOGO_PATH,
  tagline = DEFAULT_TAGLINE,
  useNextImage = false,
  NextImage,
}) => {
  const socratifyUrl = `${SOCRATIFY_BASE_URL}?utm_source=${utmSource}`;

  // Image component - use Next.js Image if available, otherwise fallback to img
  const ImageComponent = useNextImage && NextImage
    ? ({ size, className: imgClassName }: { size: number; className?: string }) => (
        <NextImage
          src={logoPath}
          alt="Socratify"
          width={size}
          height={size}
          className={imgClassName}
        />
      )
    : ({ size, className: imgClassName }: { size: number; className?: string }) => (
        <img
          src={logoPath}
          alt="Socratify"
          className={`w-${size === 20 ? 5 : size === 24 ? 6 : 8} h-${size === 20 ? 5 : size === 24 ? 6 : 8} object-contain ${imgClassName || ""}`}
          style={{ width: size, height: size }}
        />
      );

  if (variant === "minimal") {
    return (
      <a
        href={socratifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 text-neutral-500 hover:text-[#e07a2f] transition-colors ${className}`}
      >
        <span className="text-sm">Powered by</span>
        <ImageComponent size={20} className="object-contain" />
        <span className="text-sm font-medium">Socratify</span>
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <a
        href={socratifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#fdf4ed] hover:bg-[#fbe8d8] border border-[#f5d4bc] transition-colors ${className}`}
      >
        <span className="text-sm text-neutral-600">Powered by</span>
        <ImageComponent size={24} className="object-contain" />
        <span className="text-sm font-medium text-[#1a1a1a]">Socratify</span>
      </a>
    );
  }

  // Full variant (default)
  return (
    <div
      className={`rounded-2xl bg-[#fdf4ed] border border-[#f5d4bc] p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-neutral-600">Powered by</span>
            <a
              href={socratifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lg font-semibold text-[#1a1a1a] hover:text-[#e07a2f] transition-colors"
            >
              <ImageComponent size={32} className="object-contain" />
              <span>Socratify</span>
            </a>
          </div>
          <span className="text-sm text-neutral-600">{tagline}</span>
        </div>
        <a
          href={socratifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#e07a2f] hover:bg-[#c96a25] text-white font-medium transition-colors"
        >
          Visit
        </a>
      </div>
    </div>
  );
};

export default SocratifyBranding;
