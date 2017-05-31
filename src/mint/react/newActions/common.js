export const loading = type => ({
	type: `${type}_LOADING`
})

export const notify = text => ({
	type: 'NOTIFY',
	response: text
})

export const notifyClear = () => ({
	type: 'NOTIFY_CLEAR'
})