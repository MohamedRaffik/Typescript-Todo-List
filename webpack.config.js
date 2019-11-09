const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: './client/index.ts',
	output: {
		path: path.resolve('client/build'),
		filename: '[name].bundle.js',
		chunkFilename: '[name].chunk.js'
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader'
			},
			{
				enforce: 'pre',
				test: /\.js$/,
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
	plugins: [
		new MiniCSSExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css'
		}),
		new HTMLWebpackPlugin({
			template: './client/public/index.html',
			filename: 'index.html'
		})
	],
	optimization: {
		splitChunks: {
			chunks: 'all'
		},
		usedExports: true
	},
	devServer: {
		historyApiFallback: true,
		proxy: {
			'/api': { target: 'http://localhost:5000' }
		}
	}
};
