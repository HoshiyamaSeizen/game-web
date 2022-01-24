const path = require('path');

module.exports = {
	mode: 'production',
	entry: './ts/main.ts',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public'),
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
			},
		],
	},
	//devtool: 'eval-source-map',
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		compress: true,
		port: 9000,
	},
};