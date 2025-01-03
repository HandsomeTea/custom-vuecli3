/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
	mode: 'development',
	cache: true,
	devtool: 'eval-source-map',
	watchOptions: {
		ignored: /node_modules/,
	},
	plugins: [
		new ForkTsCheckerWebpackPlugin()
	],
	devServer: {
		port: 9013,
		headers: {},
		open: true,
		https: false,
		proxy: {
			'/api/project': {
				target: 'http://10.4.48.13:3003',
				changeOrigin: true,
				ws: true
			},
			'/api/v1': {
				target: 'http://10.4.48.13:3004',
				changeOrigin: true,
				ws: true
			}
		}
	}
});
