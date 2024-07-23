const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  assetPrefix: isProd ? '/MINKNFT/' : '',
  images: {
    loader: 'akamai',
    path: '',
  },
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
      // Add other pages if necessary
    }
  },
};
