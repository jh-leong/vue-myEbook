module.exports = {
	publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
	configureWebpack: {
		resolve: {
			alias: {
				'assets': '@/assets',
				'common': '@/common',
				'components': '@/components',
				'network': '@/network',
				'views': '@/views',
				'utils': '@/utils'
			}
		}
	},
	// configureWebpack: {
	// 	performance: {
	// 		hints: 'warning',
	// 		maxAssetSize: 524288,
	// 		maxEntrypointSize: 524288,
	// 	}
	// }
}