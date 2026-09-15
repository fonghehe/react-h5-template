import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  devIndicators: false,
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    '@rh5/api-client',
    '@rh5/contracts',
    '@rh5/i18n',
    '@rh5/mobile-ui',
    '@rh5/server',
    '@rh5/stores',
    '@rh5/ui-arco-mobile',
  ],
  experimental: { optimizePackageImports: ['@arco-design/mobile-react', 'lucide-react'] },
};

export default nextConfig;
