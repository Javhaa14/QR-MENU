/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@qr-menu/shared-types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
