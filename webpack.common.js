const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: './client/index.ts',
	output: {
		path: path.resolve('client/dist'),
		filename: '[name].bundle.js',
		chunkFilename: '[name].chunk.js'
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
	]
};
