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
};

export default nextConfig;
