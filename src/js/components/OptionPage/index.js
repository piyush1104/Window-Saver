import React, { Component } from 'react'
import { defaultSettings } from 'helpers/constants'

class OptionPage extends Component {
	constructor(props) {
		super(props)
		this.state = {
			settings: {},
		}
		this.handleChange = this.handleChange.bind(this)
		this.saveLocalDebounce = _.debounce(this.saveLocal, 400)
	}
	async componentDidMount() {
		let response = await browser.storage.local.get('settings')
		this.setState({ settings: response['settings'] })
	}
	handleChange(event) {
		let { settings } = this.state
		settings[event.target.id] = event.target.checked
		this.setState({ settings }, () => this.saveLocalDebounce())
	}
	saveLocal() {
		const { settings } = this.state
		browser.storage.local.set({ settings })
	}
	renderInput(key, text, className = '') {
		const { settings } = this.state
		return (
			<div className={`option-item ${className}`}>
				<input
					type="checkbox"
					id={key}
					checked={
						settings[key] === undefined ? defaultSettings[key] : settings[key]
					}
					onChange={this.handleChange}
				/>
				<label>{text}</label>
			</div>
		)
	}
	render() {
		return (
			<div className="option">
				<div className="option-text">
					Ask for <strong>confirmation</strong> before
				</div>
				<div className="option-list">
					{this.renderInput(
						'confirmSavePrivate',
						'Saving private browsing windows'
					)}
					{this.renderInput('confirmDelete', 'Deleting windows')}
					{this.renderInput('confirmOverride', 'Overriding windows')}
					{this.renderInput(
						'confirmReplaceNonPrivate',
						'Replacing non-private (normal) browsing windows'
					)}
					{this.renderInput(
						'confirmReplacePrivate',
						'Replacing private browsing windows'
					)}
				</div>
				<div className="option-text option-other">Other Settings</div>
				{this.renderInput(
					'showHints',
					'Show Hints (tooltips)',
					'option-other-item'
				)}
			</div>
		)
	}
}

export default OptionPage
