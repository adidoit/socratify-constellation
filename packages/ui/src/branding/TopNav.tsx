"use client";

import * as React from "react";

import { cn } from "../cn";

export type NavLink = {
  href: string;
  label: string;
};

export type TopNavProps = {
  links?: NavLink[];
  currentPath?: string;
  className?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
  inactiveLinkClassName?: string;
  /** Custom link component (e.g., Next.js Link). Defaults to anchor tag. */
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
};

const defaultLinks: NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
];

export function TopNav({
  links = defaultLinks,
  currentPath,
  className,
  linkClassName,
  activeLinkClassName = "text-foreground",
  inactiveLinkClassName = "text-foreground/60 hover:text-foreground",
  LinkComponent,
}: TopNavProps) {
  const Link = LinkComponent ?? "a";

  return (
    <nav className={cn("flex items-center gap-8", className)}>
      {links.map(({ href, label }) => {
        const isActive = currentPath === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "text-[15px] font-medium transition-colors duration-200",
              isActive ? activeLinkClassName : inactiveLinkClassName,
              linkClassName
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
