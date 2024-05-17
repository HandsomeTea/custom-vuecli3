/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const isTestBuild = process.argv.includes('-build-test');

module.exports = merge(common, {
	mode: 'production',
	devtool: 'source-map',
	stats: 'errors-only',
	optimization: {
		concatenateModules: true
	},
	plugins: [
		new webpack.DefinePlugin({
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
			'process.env.NODE_ENV': '"production"'
		}),
		new webpack.LoaderOptionsPlugin({
			options: {
				productionGzip: true
			}
		}),
		new webpack.ids.HashedModuleIdsPlugin({
			hashFunction: 'sha256',
			hashDigest: 'hex',
			hashDigestLength: 20
		}),
		...isTestBuild ? [new BundleAnalyzerPlugin({ analyzerHost: '0.0.0.0', analyzerPort: 8888 })] : []
	]
});
