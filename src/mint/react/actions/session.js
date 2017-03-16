import { REQUEST_SESSION, RECEIVE_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';
import fetch from 'isomorphic-fetch';

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

export function update() {
  return dispatch => {
    dispatch(request());
    return fetch('/api/session')
      .then(response => response.json())
      .then(json => dispatch(receive(json)));
  };
}

export function signUp(e, session) {
  const { cart_id, email } = session;
  e.preventDefault();
  return dispatch => {
    dispatch(requestUpdate());
    return fetch(`/createaccount?cart_id=${cart_id}&email=${email}`)
      .then(response => response.json())
      .then(json => dispatch(receiveUpdate(json)));
  };
}
