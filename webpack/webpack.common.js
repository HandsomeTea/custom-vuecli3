/* eslint-disable @typescript-eslint/no-var-requires */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const AutoImport = require('unplugin-auto-import/webpack');
const Components = require('unplugin-vue-components/webpack');
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
        // new HardSourceWebpackPlugin(),
        AutoImport({
            resolvers: [ElementPlusResolver(), VantResolver()]
        }),
        Components({
            resolvers: [ElementPlusResolver(), VantResolver()]
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
            use: [{
                loader: 'style-resources-loader',
                options: {
                    patterns: [path.resolve(__dirname, '../src/assets/style/global-var.less')]
                }
            }]
        }]
    }
};
