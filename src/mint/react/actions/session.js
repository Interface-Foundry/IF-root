import { REQUEST_SESSION, RECEIVE_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';

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
  return async dispatch => {
    dispatch(request());
    const response = await fetch('/api/session', {
      credentials: 'same-origin'
    });
    if (response.ok) dispatch(receive(await response.json()));
  };
}

export function signIn(e, cart_id, email) {
  e.preventDefault();
  return async dispatch => {
    dispatch(requestUpdate());
    const response = await fetch(`/api/identify?cart_id=${cart_id}&email=${email}`, {
      credentials: 'same-origin'
    });
    if (response.ok) dispatch(receiveUpdate(await response.json()));
  };
}
