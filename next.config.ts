import type { NextConfig } from "next";

function supabaseImagePattern(): {
  protocol: "https";
  hostname: string;
  pathname: string;
} | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname;
    return {
      protocol: "https",
      hostname: host,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      ...(supabaseImagePattern() ? [supabaseImagePattern()!] : []),
    ],
  },
};

export default nextConfig;
