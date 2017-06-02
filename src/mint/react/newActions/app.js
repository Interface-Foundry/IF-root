import { get, post } from './async';

export const toggleSidenav = () => ({
	type: 'TOGGLE_SIDENAV'
})

export const togglePopup = () => ({
	type: 'TOGGLE_POPUP'
})

export const postFeedback = (feedback) => (
  post(
    '/api/feedback', 
    'FEEDBACK',
    feedback, 
    (type, json) => ({
      type: `${type}_SUCCESS`,
      response: json,
      receivedAt: Date.now()
    })
  )
)
