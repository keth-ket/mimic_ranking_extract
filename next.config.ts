/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enables static export
  images: {
    unoptimized: true, // Disable image optimization
  },
  basePath: process.env.NODE_ENV === "production" ? "/your-repo-name" : "", // Only set basePath in production
  assetPrefix: process.env.NODE_ENV === "production" ? "/your-repo-name/" : "", // Only set assetPrefix in production
};

module.exports = nextConfig;
