/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    cache: true,
    devtool: 'eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        }),
        new ForkTsCheckerWebpackPlugin()
    ],
    devServer: {
        port: 9013,
        headers: {},
        open: true,
        https: false,
        proxy: {
            '/api/project': {
                target: 'http://localhost:3003',
                changeOrigin: true,
                ws: true
            },
            '/api/v1': {
                target: 'http://localhost:3004',
                changeOrigin: true,
                ws: true
            }
        }
    }
});
