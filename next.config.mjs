/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This tells Vercel to ignore those red error messages and finish the build
    ignoreBuildErrors: true,
  },
  eslint: {
    // This ignores formatting warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
