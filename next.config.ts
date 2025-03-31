/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enables static export
  images: {
    unoptimized: true, // Disable image optimization
  },
};

module.exports = nextConfig;