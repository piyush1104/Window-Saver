browserMod.runtime.onInstalled.addListener(init)
browserMod.runtime.onMessage.addListener(handleMessage)
const defaultSettings = {
	confirmSavePrivate: true,
	confirmDelete: true,
	confirmOverride: true,
	confirmReplaceNonPrivate: false,
	confirmReplacePrivate: false,
	showHints: true,
}
async function init() {
	const response = await browserMod.storage.local.get('settings')
	if (response && response['settings']) {
		return
	}
	browserMod.storage.local.set({ settings: defaultSettings })
}
async function handleMessage(request) {
	if (request.task === 'open_separate' || request.task === 'open_same') {
		let currentWindow = await browserMod.windows.getCurrent()
		let tabList = request.data
		let windowInfo = await browserMod.windows.create()
		let errors = []
		let length = tabList.length
		for (var i = 0; i < length; i++) {
			let tab = tabList[i]
			try {
				if (
					typeof browser !== 'undefined' &&
					Object.getPrototypeOf(browser) === Object.prototype
				) {
					await browserMod.tabs.create({
						active: false,
						discarded: true,
						title: tab.title,
						url: tab.url,
						windowId: windowInfo.id,
					})
				} else {
					await browserMod.tabs.create({
						active: false,
						url: tab.url,
						windowId: windowInfo.id,
					})
				}
			} catch (err) {
				errors.push(tab)
			}
		}
		let response = await browserMod.tabs.query({ windowId: windowInfo.id })
		await browserMod.tabs.move(response[0]['id'], { index: -1 })
		console.log('<==== Following tabs could not be opened ====>')
		console.log(errors)
		request.task === 'open_same' && browserMod.windows.remove(currentWindow.id)
	}
}
