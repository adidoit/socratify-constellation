"use client";

import {
  SocratifyBranding as BaseSocratifyBranding,
  type SocratifyBrandingProps as BaseSocratifyBrandingProps,
} from "@/app/lib/socratify";
import Image from "next/image";
import React from "react";

type SocratifyBrandingProps = Omit<BaseSocratifyBrandingProps, "utmSource"> & {
  utmSource?: string;
};

export const SocratifyBranding: React.FC<SocratifyBrandingProps> = ({
  utmSource = "whiteboard",
  ...props
}) => {
  return (
    <BaseSocratifyBranding
      utmSource={utmSource}
      useNextImage
      NextImage={Image}
      {...props}
    />
  );
};

export default SocratifyBranding;
