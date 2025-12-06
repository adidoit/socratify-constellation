"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TopNav as BaseTopNav } from "@constellation/ui";

export function TopNav() {
  const pathname = usePathname();

  return (
    <BaseTopNav
      currentPath={pathname ?? undefined}
      LinkComponent={Link}
      className="hidden md:flex"
    />
  );
}
