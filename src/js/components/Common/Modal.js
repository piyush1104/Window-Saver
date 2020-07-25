import React, { Component } from 'react'

class Modal extends Component {
	constructor(props) {
		super(props)
		this.handleClickOutside = this.handleClickOutside.bind(this)
	}
	componentDidMount() {
		let modalContent = document.getElementById('modal-content')
		modalContent.addEventListener('mousedown', this.handleClickOutside)
	}
	componentWillUnmount() {
		let modalContent = document.getElementById('modal-content')
		modalContent.removeEventListener('mousedown', this.handleClickOutside)
	}
	handleClickOutside(event) {
		const { open } = this.props
		let modal = document.getElementById('modal-body')
		if (modal && open && !modal.contains(event.target)) {
			this.props.close()
		}
	}
	render() {
		const { children, className, open } = this.props
		return (
			<div
				id="modal"
				className={`modal ${open ? 'modal-open' : 'modal-close'} ${
					className || ''
				}`}>
				<div className="modal-backdrop"></div>
				<div id="modal-content" className="modal-content">
					<div id="modal-body" className="modal-body">
						{children}
					</div>
				</div>
			</div>
		)
	}
}

export default Modal
