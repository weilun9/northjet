/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Ensure the seed route's CSV is bundled into the serverless function on Vercel.
  // Without this, fs.readFileSync('data/randomnames.csv') throws ENOENT in production.
  experimental: {
    outputFileTracingIncludes: {
      '/api/seed': ['./data/**/*'],
    },
  },
};

export default nextConfig;
