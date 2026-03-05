/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Uncomment when add value for NEXT_PUBLIC_PATH in .env.production or .env.development
    // basePath: process.env.NEXT_PUBLIC_PATH,
    trailingSlash: true,
};

export default nextConfig;
