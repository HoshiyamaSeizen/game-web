const path = require('path');

module.exports = {
	mode: 'production',
	entry: './ts/main.ts',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public'),
		publicPath: '/public/',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				include: path.join(__dirname, 'ts'),
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
