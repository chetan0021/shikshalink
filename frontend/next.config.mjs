/** @type {import('next').NextConfig} */
const backendBase =
  process.env.BACKEND_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "http://127.0.0.1:8000";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async rewrites() {
    const base = backendBase.replace(/\/$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${base}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

