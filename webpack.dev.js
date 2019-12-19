const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					configFile: path.resolve('client/tsconfig.json')
				}
			},
			{
				enforce: 'pre',
				test: /\.jsx?$/,
				loader: 'source-map-loader'
			},
			{
				test: /\.(css|scss)$/,
				use: [
					MiniCSSExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: { modules: true }
					},
					'sass-loader',
					'postcss-loader'
				]
			},
			{
				test: /\.(png|svg|jpg|gif|ico)$/,
				use: [
					{
						loader: 'url-loader',
						options: { limit: 8192 }
					}
				]
			}
		]
	},
	devServer: {
		historyApiFallback: true,
		proxy: {
			'/api': { target: 'http://localhost:5000' }
		}
	}
});
