/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO: fix legacy type errors in pages/ and components/customer/ then remove
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
