/* eslint-disable @typescript-eslint/no-var-requires */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

module.exports = {
    target: 'web',
    plugins: [
        new CleanWebpackPlugin()
    ],
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
