/* eslint-disable @typescript-eslint/no-var-requires */
const webpackConfig = require('./webpack');

module.exports = {
	transpileDependencies: true,
	lintOnSave: false,
	configureWebpack: () => {
		return webpackConfig[process.env.NODE_ENV];
	}
};
