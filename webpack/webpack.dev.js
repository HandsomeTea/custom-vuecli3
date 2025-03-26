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
				target: 'http://localhost:3003',
				changeOrigin: true,
				ws: true
			},
			'/api/v1': {
				target: 'http://localhost:3004',
				changeOrigin: true,
				ws: true
			},
			'/ws/ai/chat': {
				target: 'ws://localhost:3421',
				changeOrigin: true,
				ws: true
			},
			'/ws/ai/image': {
				target: 'ws://localhost:3422',
				changeOrigin: true,
				ws: true
			},
			'/ws/ai/audio': {
				target: 'ws://localhost:3423',
				changeOrigin: true,
				ws: true
			},
			'/ws/ai/video': {
				target: 'ws://localhost:3424',
				changeOrigin: true,
				ws: true
			}
		}
	}
});
