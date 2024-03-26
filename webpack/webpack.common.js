/* eslint-disable @typescript-eslint/no-var-requires */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const AutoImport = require('unplugin-auto-import/webpack');
const Components = require('unplugin-vue-components/webpack');
// const IconsResolver = require('unplugin-icons/resolver');
const { ElementPlusResolver, VantResolver } = require('unplugin-vue-components/resolvers');
const path = require('path');
const vendorPackage = ['axios', 'vant', 'vue', 'vue-i18n', 'vue-router', 'vuex', 'element-plus', 'lodash'];
const catchPackagesGrouped = () => {
	const result = {};

	vendorPackage.map(package => {
		result[package] = {
			test: module => module.resource && /\.js$/.test(module.resource) && module.resource.includes(path.join(__dirname, `../node_modules/${package}/`)),
			name: package,
			chunks: 'all'
		};
	});

	return result;
};

module.exports = {
	target: 'web',
	plugins: [
		new CleanWebpackPlugin(),
		AutoImport({
			resolvers: [
				ElementPlusResolver(),
				VantResolver()
				// IconsResolver({
				//     prefix: 'Icon'
				// })
			]
		}),
		Components({
			resolvers: [
				ElementPlusResolver(),
				VantResolver()
				// IconsResolver({
				//     enabledCollections: ['ep']
				// })
			]
		})
	],
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			chunks: 'async',
			cacheGroups: {
				...catchPackagesGrouped()
			}
		},
		minimize: true
	},
	module: {
		rules: [{
			test: /\.(css|less)$/,
			use: ['postcss-loader']
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
