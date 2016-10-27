const { resolve } = require('path');
const webpack = require('webpack');

module.exports = {
	entry: resolve('webpack/main'),
	output: {
		path: resolve('docs/assets/scripts'),
		publicPath: '/assets/scripts',
		filename: 'main.js'
	},
	module: {
		loaders: [{
			test: new RegExp('.js$'),
			exclude: new RegExp('node_modules'),
			loaders: ['babel-loader']
		}]
	},
	resolve: {
		root: ['webpack'],
		extensions: ['', '.js', '.styl'],
		alias: {
			'fluid-program': resolve('program'),
			'fluid-program/sample': resolve('program/sample')
		}
	},
	plugins: process.env.NODE_ENV === 'production' ? [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.DedupePlugin,
		new webpack.optimize.OccurenceOrderPlugin,
		new webpack.optimize.AggressiveMergingPlugin,
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			mangle: true,
			output: {
				comments: require('uglify-save-license')
			},
			compress: {
				warnings: false,
				sequences: true,
				properties: true,
				dead_code: true,
				conditionals: true,
				booleans: true,
				unused: true,
				if_return: true,
				join_vars: true,
				drop_console: true
			},
			beautify: false,
			sourceMap: false
		})
	] : [],
	debug: false
};
