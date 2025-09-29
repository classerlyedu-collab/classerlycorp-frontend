const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Optimize for production builds
            if (process.env.NODE_ENV === 'production') {
                // Disable source maps for production
                webpackConfig.devtool = false;

                // Optimize chunks
                webpackConfig.optimization = {
                    ...webpackConfig.optimization,
                    splitChunks: {
                        chunks: 'all',
                        cacheGroups: {
                            vendor: {
                                test: /[\\/]node_modules[\\/]/,
                                name: 'vendors',
                                chunks: 'all',
                                priority: 10,
                            },
                            common: {
                                name: 'common',
                                minChunks: 2,
                                chunks: 'all',
                                priority: 5,
                                reuseExistingChunk: true,
                            },
                        },
                    },
                };
            }

            return webpackConfig;
        },
    },
    babel: {
        plugins: [
            // Remove console.log in production
            ...(process.env.NODE_ENV === 'production'
                ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
                : []
            ),
        ],
    },
};
