import { LOGGED_IN, ONBOARD_NEW_USER, REGISTER_EMAIL, REQUEST_SESSION, RECEIVE_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';

const receive = (newInfo) => ({
  type: RECEIVE_SESSION,
  ...newInfo
});

const request = () => ({
  type: REQUEST_SESSION
});

const requestUpdate = () => ({
  type: REQUEST_UPDATE_SESSION
});

const receiveUpdate = (newInfo) => ({
  type: RECEIVE_UPDATE_SESSION,
  ...newInfo
});

export const onboardNewUser = () => ({
  type: ONBOARD_NEW_USER
})
export const registerEmail = () => ({
  type: REGISTER_EMAIL
})

export const loggedIn = (accounts) => ({
  type: LOGGED_IN,
  accounts
})

export function update() {
  return async dispatch => {
    dispatch(request());
    const response = await fetch('/api/session', {
      credentials: 'same-origin'
    });
    if (response.ok) return dispatch(receive(await response.json()));
  };
}

export function signIn(cart_id, email) {
  return async dispatch => {
    dispatch(requestUpdate());
    const response = await fetch(`/api/identify?cart_id=${cart_id}&email=${email}`, {
      credentials: 'same-origin'
    });
    if (response.ok) return dispatch(receiveUpdate(await response.json()));
  };
}



