import React from 'react'

const ConfirmationPopup = props => (
	<div className={'modal-delete' + ' ' + (props.className || '')}>
		<div className="confirmation-text">
			{props.confirmText} -{' '}
			{!props.hideTitle && (
				<div className="confirmation-text-window">
					{props.title}
					<span>?</span>
				</div>
			)}
		</div>
		<div className="confirmation-actions">
			<button onClick={props.cancel} className="button-cancel">
				Cancel
			</button>
			<button onClick={props.doAction} className="button-delete">
				{props.actionText || 'Delete'}
			</button>
		</div>
	</div>
)

export default ConfirmationPopup
