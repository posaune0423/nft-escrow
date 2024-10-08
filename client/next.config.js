/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: "utfs.io" },
      { hostname: "nft-cdn.alchemy.com" },
      { hostname: "ipfs.io" },
      { hostname: "alchemy.mypinata.cloud" },
      { hostname: "static.alchemyapi.io" },
      { hostname: "s3-ap-northeast-1.amazonaws.com" },
      { hostname: "drive.google.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "drive.google.com" },
      { hostname: "googleusercontent.com" },
    ],
    minimumCacheTTL: 0,
    disableStaticImages: true,
  },
  webpack: (config, context) => {
    if (!context.isServer) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.tls = false;
      config.resolve.fallback.child_process = false;
    }

    return config;
  },
};

module.exports = nextConfig;
