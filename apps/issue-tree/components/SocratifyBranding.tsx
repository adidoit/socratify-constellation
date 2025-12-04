/**
 * Re-export from synced socratify-components.
 * Source: socratify/socratify-components (run sync.sh to update)
 */
"use client";

import {
  SocratifyBranding as BaseSocratifyBranding,
  type SocratifyBrandingProps as BaseSocratifyBrandingProps,
} from "@/app/lib/socratify";
import React from "react";

// Pre-configured props for this project
type SocratifyBrandingProps = Omit<BaseSocratifyBrandingProps, "utmSource"> & {
  utmSource?: string;
};

export const SocratifyBranding: React.FC<SocratifyBrandingProps> = ({
  utmSource = "issuetree",
  ...props
}) => {
  return <BaseSocratifyBranding utmSource={utmSource} {...props} />;
};

export default SocratifyBranding;
