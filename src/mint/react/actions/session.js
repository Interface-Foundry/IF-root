import { LOGGED_IN, ONBOARD_NEW_USER, REGISTER_EMAIL, REQUEST_SESSION, RECEIVE_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';

const receive = (newSession) => ({
  type: RECEIVE_SESSION,
  newSession
});

const request = () => ({
  type: REQUEST_SESSION
});

const requestUpdate = () => ({
  type: REQUEST_UPDATE_SESSION
});

const receiveUpdate = (newSession) => ({
  type: RECEIVE_UPDATE_SESSION,
  newSession
});

export const onboardNewUser = () => ({
  type: ONBOARD_NEW_USER
})
export const registerEmail = () => ({
  type: REGISTER_EMAIL
})

export const loggedIn = (user_accounts) => ({
  type: LOGGED_IN,
  user_accounts
})

export function update() {
  return async dispatch => {
    dispatch(request());

    (async() => {
      try {
        const response = await fetch('/api/session', {
          credentials: 'same-origin'
        });
        return dispatch(receive(await response.json()));
      } catch (e) {
        console.log('error in session update')
      }
    })();
  };
}

export function signIn(cart_id, email) {
  return async dispatch => {
    dispatch(requestUpdate());

    (async() => {
      try {
        const response = await fetch(`/api/identify?cart_id=${cart_id}&email=${email}`, {
          credentials: 'same-origin'
        })
        return dispatch(receiveUpdate(await response.json()));
      } catch (e) {
        console.log('error in session signIn')
      }
    })();
  };
}



