browser.runtime.onInstalled.addListener(init)
browser.runtime.onMessage.addListener(handleMessage)
const defaultSettings = {
	confirmSavePrivate: true,
	confirmDelete: true,
	confirmOverride: true,
	confirmReplaceNonPrivate: false,
	confirmReplacePrivate: false,
	showHints: true,
}
async function init() {
	const response = await browser.storage.local.get('settings')
	if (response && response['settings']) {
		return
	}
	browser.storage.local.set({ settings: defaultSettings })
}
async function handleMessage(request) {
	if (request.task === 'open_separate' || request.task === 'open_same') {
		let currentWindow = await browser.windows.getCurrent()
		let tabList = request.data
		let windowInfo = await browser.windows.create()
		let errors = []
		let length = tabList.length
		for (var i = 0; i < length; i++) {
			let tab = tabList[i]
			try {
				await browser.tabs.create({
					active: false,
					discarded: true,
					title: tab.title,
					url: tab.url,
					windowId: windowInfo.id,
				})
			} catch (err) {
				errors.push(tab)
			}
		}
		let response = await browser.tabs.query({ windowId: windowInfo.id })
		await browser.tabs.move(response[0]['id'], { index: -1 })
		console.log('<==== Following tabs could not be opened ====>')
		console.log(errors)
		request.task === 'open_same' && browser.windows.remove(currentWindow.id)
	}
}
