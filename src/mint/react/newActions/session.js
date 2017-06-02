import { get, post } from './async'

export const checkSession = () => get(
	'/api/session',
	'SESSION',
	(type, json) => ({
		type: `${type}_SUCCESS`,
		response: json,
		receivedAt: Date.now()
	})
)
