'use client';

import React from 'react';

export type SocratifyBrandingVariant = 'full' | 'compact' | 'minimal';

export type SocratifyBrandingProps = {
  variant?: SocratifyBrandingVariant;
  utmSource: string;
  className?: string;
  showArrow?: boolean;
  logoPath?: string;
  tagline?: string;
  useNextImage?: boolean;
  NextImage?: React.ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>;
  clickable?: boolean;
};

const SOCRATIFY_BASE_URL = 'https://socratify.com';
const DEFAULT_LOGO_PATH = 'https://cdn.socratify.com/logo.png';
const DEFAULT_TAGLINE = 'Sharpen how you think and speak';

export const SocratifyBranding: React.FC<SocratifyBrandingProps> = ({
  variant = 'full',
  utmSource,
  className = '',
  showArrow: _showArrow = false,
  logoPath = DEFAULT_LOGO_PATH,
  tagline = DEFAULT_TAGLINE,
  useNextImage = false,
  NextImage,
  clickable = true,
}) => {
  const socratifyUrl = `${SOCRATIFY_BASE_URL}?utm_source=${utmSource}`;

  const ImageComponent =
    useNextImage && NextImage
      ? ({ size, className: imgClassName }: { size: number; className?: string }) => (
          <NextImage src={logoPath} alt="Socratify" width={size} height={size} className={imgClassName} />
        )
      : ({ size, className: imgClassName }: { size: number; className?: string }) => (
          <img
            src={logoPath}
            alt="Socratify"
            className={`w-${size === 20 ? 5 : size === 24 ? 6 : 8} h-${size === 20 ? 5 : size === 24 ? 6 : 8} object-contain ${imgClassName || ''}`}
            style={{ width: size, height: size }}
          />
        );

  if (variant === 'minimal') {
    if (clickable) {
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
    return (
      <div className={`inline-flex items-center gap-2 text-neutral-500 ${className}`}>
        <span className="text-sm">Powered by</span>
        <ImageComponent size={20} className="object-contain" />
        <span className="text-sm font-medium">Socratify</span>
      </div>
    );
  }

  if (variant === 'compact') {
    if (clickable) {
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
    return (
      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#fdf4ed] border border-[#f5d4bc] ${className}`}>
        <span className="text-sm text-neutral-600">Powered by</span>
        <ImageComponent size={24} className="object-contain" />
        <span className="text-sm font-medium text-[#1a1a1a]">Socratify</span>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-[#fdf4ed] border border-[#f5d4bc] p-6 ${className}`}>
      <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-neutral-600">Powered by</span>
            {clickable ? (
              <a
                href={socratifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lg font-semibold text-[#1a1a1a] hover:text-[#e07a2f] transition-colors"
              >
                <ImageComponent size={32} className="object-contain" />
                <span>Socratify</span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 text-lg font-semibold text-[#1a1a1a]">
                <ImageComponent size={32} className="object-contain" />
                <span>Socratify</span>
              </div>
            )}
          </div>
          <span className="text-sm text-neutral-600">{tagline}</span>
        </div>
        {clickable ? (
          <a
            href={socratifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#e07a2f] hover:bg-[#c96a25] text-white font-medium transition-colors"
          >
            Visit
          </a>
        ) : (
          <div className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#e07a2f] text-white font-medium opacity-70 cursor-default">
            Visit
          </div>
        )}
      </div>
    </div>
  );
};

export default SocratifyBranding;
