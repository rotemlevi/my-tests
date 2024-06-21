const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  assetPrefix: isProd ? '/my-tests/' : '',
  basePath: isProd ? '/my-tests' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  output: 'export',
};