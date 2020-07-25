process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'
process.env.INLINE_RUNTIME_CHUNK = 'false'
process.env.OPTIONS = true
process.env.ENTRY_POINT = 'options'

const fs = require('fs-extra')
const paths = require('../config/paths')
const webpack = require('webpack')
const webpackconfig = require('../config/webpack.config')
const config = webpackconfig('development', true)

// removes react-dev-utils/webpackHotDevClient.js at first in the array
// already handled in webpackconfig
// config.entry.shift()
// config.entry = config.entry.filter(
// 	fileName => !fileName.match(/webpackHotDevClient/)
// )

// already handled in webpackconfig
// config.plugins = config.plugins.filter(
// 	plugin => !(plugin instanceof webpack.HotModuleReplacementPlugin)
// )

// to speed up rebuild time
// config.mode = 'development'
// while developing the browser extension, this will give error.
// config.devtool = 'eval-cheap-module-source-map'
delete config.optimization
// config.optimization = false

// fix publicPath and output path ( I am letting the public path to remain the same)
// config.output.publicPath = pkg.homepage
// config.output.path = paths.appBuild // else it will put the outputs in the dist folder

// watchoptions ( do we need, them no fucking idea.)
config.watch = true
config.watchOptions = {
	poll: false,
	ignored: /node_modules/,
	aggregateTimeout: 1000,
}

webpack(config).watch({}, (err, stats) => {
	console.log('\n<<================================================>>\n')
	if (err) {
		console.error('Here comes some error\n')
		console.error(err)
	} else {
		// this just exists to copy the remaining thing from the public folder to build folder ( see build.js)
		copyPublicFolder()
	}
	console.error(
		stats.toString({
			chunks: false,
			colors: true,
		})
	)
})

// copy favicon.ico and robots.txt from public to build folder
function copyPublicFolder() {
	fs.copySync(paths.appPublic, paths.appBuild, {
		dereference: true,
		filter: file => file !== paths.indexHtml && file !== paths.optionsHtml,
	})
}
