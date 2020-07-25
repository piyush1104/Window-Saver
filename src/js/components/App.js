import React, { Component } from 'react'
import Modal from 'Common/Modal'
import ConfirmationPopup from './ConfirmationPopup'
import { defaultSettings } from 'helpers/constants'

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			name: '',
			list: [],
			modalChild: null,
			open: false,
			settings: defaultSettings,
			loaderIndex: -1,
		}
		this.saveLocalDebounce = _.debounce(this.saveLocal, 400).bind(this)
	}
	async componentDidMount() {
		let response = await browser.storage.local.get(['list', 'settings'])
		let list =
			!_.isEmpty(response.list) && _.isArray(response.list) ? response.list : []
		let settings = !_.isEmpty(response.settings)
			? response.settings
			: defaultSettings
		this.setState({ list, settings }, () =>
			document.getElementById('name-input').focus()
		)
	}
	saveLocal() {
		const { list } = this.state
		browser.storage.local.set({ list })
	}
	async saveWindow() {
		const { list, name } = this.state
		let tabList = await browser.tabs.query({ currentWindow: true })
		let time = new Date().valueOf()
		list.push({
			title: name,
			description: '',
			createdAt: time,
			updatedAt: time,
			urls: tabList,
		})
		this.setState({ list }, this.saveLocalDebounce)
	}
	async handleSave() {
		let { settings, name } = this.state
		if (!name) {
			return
		}
		const currentWindow = await browser.windows.getCurrent()
		if (currentWindow.incognito && settings.confirmSavePrivate) {
			let modalChild = (
				<ConfirmationPopup
					confirmText="Save Private window"
					hideTitle={true}
					cancel={() => this.setState({ open: false })}
					doAction={this.saveWindow.bind(this)}
					actionText="Save"
				/>
			)
			this.setState({ open: true, modalChild })
		} else {
			this.saveWindow()
		}
	}
	deleteWindow(index) {
		let { list } = this.state
		list.splice(index, 1)
		this.setState({ list, open: false }, this.saveLocalDebounce)
	}
	handleDelete(index) {
		const { list, settings } = this.state
		if (settings.confirmDelete) {
			let modalChild = (
				<ConfirmationPopup
					confirmText="Delete window"
					title={list[index]['title']}
					cancel={() => this.setState({ open: false })}
					doAction={this.deleteWindow.bind(this, index)}
					actionText="Delete"
				/>
			)
			this.setState({ open: true, modalChild })
		} else {
			this.deleteWindow(index)
		}
	}
	async overrideWindow(index) {
		this.setState({ loaderIndex: index })
		let { list } = this.state
		let tabList = await browser.tabs.query({ currentWindow: true })
		let time = new Date().valueOf()
		list[index] = { ...list[index], urls: tabList, updatedAt: time }
		this.setState({ open: false, list }, () => {
			setTimeout(() => this.setState({ loaderIndex: -1 }), 400)
			this.saveLocalDebounce()
		})
	}
	handleOverride(index) {
		const { list, settings } = this.state
		if (settings.confirmOverride) {
			let modalChild = (
				<ConfirmationPopup
					confirmText="Override window"
					title={list[index]['title']}
					cancel={() => this.setState({ open: false })}
					doAction={this.overrideWindow.bind(this, index)}
					actionText="Override"
				/>
			)
			this.setState({ open: true, modalChild })
		} else {
			this.overrideWindow(index)
		}
	}
	openClose(index) {
		const { list } = this.state
		browser.runtime.sendMessage({
			task: 'open_same',
			data: list[index]['urls'],
		})
	}
	async handleCloseOpen(index) {
		const { settings } = this.state
		const currentWindow = await browser.windows.getCurrent()
		if (currentWindow.incognito && settings.confirmReplacePrivate) {
			let modalChild = (
				<ConfirmationPopup
					confirmText="Close all tabs of current Private window?"
					hideTitle={true}
					cancel={() => this.setState({ open: false })}
					doAction={this.openClose.bind(this, index)}
					actionText="Replace All"
				/>
			)
			this.setState({ open: true, modalChild })
		} else if (!currentWindow.incognito && settings.confirmReplaceNonPrivate) {
			let modalChild = (
				<ConfirmationPopup
					confirmText="Close all tabs of current window?"
					hideTitle={true}
					cancel={() => this.setState({ open: false })}
					doAction={this.openClose.bind(this, index)}
					actionText="Replace All"
				/>
			)
			this.setState({ open: true, modalChild })
		} else {
			this.openClose(index)
		}
	}
	async handleOpenNew(index) {
		const { list } = this.state
		browser.runtime.sendMessage({
			task: 'open_separate',
			data: list[index]['urls'],
		})
	}
	render() {
		const { name, list, modalChild, open, loaderIndex, settings } = this.state
		let tooltipClass = settings['showHints'] ? 'tooltip' : ''
		return (
			<div className="app">
				<div className="input-div row">
					<input
						placeholder="A name for window to be saved"
						className="name-input font-inherit"
						id="name-input"
						onChange={e => this.setState({ name: e.target.value })}
						onKeyDown={e => {
							console.log('wait')
							if (!e.shiftKey && e.key === 'Enter') {
								e.preventDefault()
								this.handleSave()
							}
						}}
						value={name}
					/>
					<button
						data-tooltip="Save new window"
						style={{ '--data-width': '120px' }}
						className={'save-button font-inherit tooltip-sw ' + tooltipClass}
						onClick={this.handleSave.bind(this)}>
						Save
					</button>
				</div>
				<div className="list">
					{list.map((item, index) => {
						return (
							<div key={index} className="row">
								<button
									data-tooltip="Delete window"
									style={{ '--data-width': '100px' }}
									className={'delete action tooltip-se ' + tooltipClass}
									onClick={this.handleDelete.bind(this, index)}>
									<i className="icon-trash-empty" />
								</button>
								<button
									data-tooltip="Override window with current tabs"
									style={{ '--data-width': '230px', '--data-left': '-50px' }}
									className={'override action tooltip-s-custom ' + tooltipClass}
									onClick={this.handleOverride.bind(this, index)}>
									<i
										className={`icon-spin3 ${
											loaderIndex === index ? 'rotate' : ''
										}`}
									/>
								</button>
								<div
									data-tooltip="Open new window"
									style={{ '--data-width': '120px' }}
									role="button"
									className={'title font-inherit tooltip-s ' + tooltipClass}
									onClick={this.handleOpenNew.bind(this, index)}>
									{item.title}
									<div className="frontground" />
									<span className="popup icon-popup" />
								</div>
								<button
									data-tooltip="Replace current window with this"
									style={{ '--data-width': '220px' }}
									className={'close-open action tooltip-sw ' + tooltipClass}
									onClick={this.handleCloseOpen.bind(this, index)}>
									<i className="icon-switch" />
								</button>
							</div>
						)
					})}
				</div>
				<Modal open={open} close={() => this.setState({ open: false })}>
					{modalChild}
				</Modal>
				<div className="info row">
					<button
						data-tooltip="Open options page"
						style={{ '--data-width': '130px' }}
						onClick={() => browser.runtime.openOptionsPage()}
						className={'options tooltip-ne ' + tooltipClass}>
						<i className="icon-cog" />
					</button>
					<div className="extension-name">Window Saver v1.7</div>
					<button
						data-tooltip="See version info"
						style={{ '--data-width': '110px' }}
						onClick={() =>
							browser.tabs.create({
								url:
									'https://addons.mozilla.org/en/firefox/addon/window-saver/versions/',
							})
						}
						className={'version tooltip-nw ' + tooltipClass}>
						1.7
					</button>
				</div>
			</div>
		)
	}
}

export default App
