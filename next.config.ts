import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;


/*

import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  analyzerMode: 'static'
});

export default withBundleAnalyzer({
  reactStrictMode: true,

  webpack(config) {

    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new (require('webpack-bundle-analyzer')
        .BundleAnalyzerPlugin)({

          analyzerMode: 'disabled',
          generateStatsFile: true,
          statsFilename: 'stats.json'
          
        })
      );
    }

    return config;
  }

});

*/