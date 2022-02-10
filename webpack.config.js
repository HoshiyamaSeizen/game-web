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
		alias: {
			Assets: path.resolve(__dirname, 'public/assets'),
			Data: path.resolve(__dirname, 'public/data'),
		},
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
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		compress: true,
		port: 9000,
	},
};
