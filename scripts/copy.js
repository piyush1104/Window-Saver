const fs = require('fs-extra')
const paths = require('../config/paths')
// copy favicon.ico and robots.txt from public to build folder
function copyPublicFolder() {
	fs.copySync(paths.appPublic, paths.appBuild, {
		dereference: true,
		filter: file => file !== paths.indexHtml && file !== paths.optionsHtml,
	})
}

copyPublicFolder()
