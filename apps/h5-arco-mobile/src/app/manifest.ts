import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'React H5 · Arco Mobile',
    short_name: 'React H5',
    description: 'Next.js mobile monorepo template',
    start_url: '/home',
    display: 'standalone',
    background_color: '#f4f7fb',
    theme_color: '#4169e1',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
