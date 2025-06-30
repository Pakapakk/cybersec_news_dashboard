// /** @type {import('next').NextConfig} */
// const nextConfig = {};

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
    autoPrerender: false,
  },
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://senior-project-55328.firebaseapp.com/__/auth/:path*"
      }
    ];
  }
};

export default nextConfig;

