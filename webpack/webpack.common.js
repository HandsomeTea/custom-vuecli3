/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const AutoImport = require('unplugin-auto-import/webpack');
const Components = require('unplugin-vue-components/webpack');
// const IconsResolver = require('unplugin-icons/resolver');
const { ElementPlusResolver, VantResolver, ArcoResolver } = require('unplugin-vue-components/resolvers');
const vendorPackage = [
	'vue', 'vue-i18n', 'vue-router', 'vuex',
	'vant', 'element-plus', '@arco-design/web-vue',
	'axios', 'lodash', 'cytoscape'
];
const catchPackagesGrouped = () => {
	const result = {};

	vendorPackage.map(package => {
		result[package] = {
			// test: new RegExp(`[\\\\/]node_modules[\\\\/]${package}[\\\\/]`),
			test: module => {
				return module.resource && module.resource.includes(`/node_modules/${package}/`);
			},
			name: package,
			minSize: 0,
			priority: 120,
			maxInitialRequests: 10,
			chunks: 'all',
			minChunks: 1
		};
	});

	return result;
};

module.exports = {
	target: 'web',
	plugins: [
		new webpack.DefinePlugin({
			__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
		}),
		new CleanWebpackPlugin(),
		AutoImport({
			resolvers: [
				ElementPlusResolver(),
				VantResolver(),
				ArcoResolver()
				// IconsResolver({
				//     prefix: 'Icon'
				// })
			]
		}),
		Components({
			resolvers: [
				ElementPlusResolver(),
				VantResolver(),
				ArcoResolver()
				// IconsResolver({
				//     enabledCollections: ['ep']
				// })
			]
		})
	],
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				...catchPackagesGrouped()
			}
		},
		minimize: true
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: ['postcss-loader']
		}, {
			test: /\.less$/,
			use: [{
				loader: 'less-loader',
				options: {
					additionalData: `@import '/src/assets/style/global-var.less';`,
				}
			}, 'postcss-loader']
		}, {
			// 图片单独打包到一个文件夹
			test: /\.(png|jpe?g|gif|eot|svg|tff|woff|woff2|webp)(\?.*)?$/,
			type: 'asset/resource',
			generator: {
				filename: 'image/[name].[hash:8].[ext]'
			}
		}]
	}
};
