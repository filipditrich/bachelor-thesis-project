const path = require('path');

/**
 * Next.js configuration
 * @type {import("next").NextConfig}
 */
module.exports = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'page.ts', 'api.tsx', 'api.ts', 'config.ts', 'config.tsx'],
  swcMinify: true,
  webpack: (config, { isServer, defaultLoaders }) => {
    /** enable inline SVG icon file imports (as components) */
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.tsx?$/,
      include: [path.resolve(__dirname, './src/lib/graphics')],
      use: [
        defaultLoaders.babel,
        {
          loader: '@svgr/webpack',
          options: {
            babel: false,
            icon: true,
          },
        },
      ],
    });
    
    /** enable inline SVG imports (as string) */
    config.module.rules.push({
      test: /\.svg$/,
      include: [path.resolve(__dirname, './src/pages/api/data')],
      loader: 'svg-inline-loader'
    });
    
    return config;
  },
};
