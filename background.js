const defaultFolderName = 'Window Saver'
browser.bookmarks.onRemoved.addListener(handleFolderRemoved)
browser.runtime.onMessage.addListener(handleMessage)
async function handleMessage(request, sender, sendResponse) {
	console.log(request)
	console.log(sender)
	if (request.task === 'open_separate') {
		let tabList = await browser.tabs.query({ currentWindow: true })
		let windowInfo = await browser.windows.create()
		console.log('I call this bullshit')
		console.log(tabList)
		console.log(windowInfo.id)
		let errors = []
		let length = tabList.length
		for (var i = 0; i < length; i++) {
			let tab = tabList[i]
			console.log(windowInfo.id)
			// console.log(tab.url)
			try {
				let response = await browser.tabs.create({
					active: false,
					discarded: true,
					title: tab.title,
					url: tab.url,
				})
				console.log('it worked')
			} catch (err) {
				console.log('it failed')
				console.log(err)
				errors.push(tab)
			}
		}
		console.log('what the hell')
		errors.length > 0 && browser.browserAction.openPopup()
	}
}

initDefaultSettings()

function initDefaultSettings() {
	initFolderSettings()
	initSetting('deleteAfter', false)
	initSetting('confirmSavePrivate', true)
	initSetting('confirmDelete', true)
	initSetting('confirmOverride', true)
	initSetting('confirmCloseNonPrivate', false)
	initSetting('confirmClosePrivate', false)
	initSetting('showPlaceholder', true)

	async function initSetting(name, value) {
		let setting = await browser.storage.local.get(name)
		if ('undefined' == typeof setting[name]) {
			browser.storage.local.set({ [name]: value })
		}
	}

	async function initFolderSettings() {
		let foundSettings = await browser.storage.local.get('folderId')
		if ('undefined' == typeof foundSettings.folderId) {
			let id = await findOrCreateFolder(defaultFolderName)
			browser.storage.local.set({ folderId: id })
		}
	}
}

async function findOrCreateFolder(name) {
	let results = await browser.bookmarks.search({ title: name })

	if (results.length === 0) {
		let id = await createFolder()
		return id
	} else if (results.length === 1) {
		return results[0].id
	} else {
		let candidate = null
		for (let result of results) {
			if (
				'undefined' == typeof result.url &&
				'unfiled_____' === result.parentId
			) {
				if (candidate) {
					// more than one valid candidate
					throw new Error('more than one folder with name: ' + name)
				} else {
					candidate = result
				}
			}
		}
		if (candidate) {
			return candidate.id
		} else {
			return await createFolder()
		}
	}

	async function createFolder() {
		let folder = await browser.bookmarks.create({ title: name })
		return folder.id
	}
}

async function handleFolderRemoved(id, info) {
	let settings = await browser.storage.local.get('folderId')
	if (id === settings.folderId) {
		// They deleted our folder! We go back to the default.
		let id = await findOrCreateFolder(defaultFolderName)
		browser.storage.local.set({ folderId: id })
	}
}
