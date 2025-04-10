/* eslint-disable @typescript-eslint/no-var-requires */
const webpackConfig = require('./webpack');

module.exports = {
	transpileDependencies: true,
	lintOnSave: false,
	publicPath: process.env.PUBLIC_PATH,
	configureWebpack: () => {
		return webpackConfig[process.env.NODE_ENV];
	}
};
