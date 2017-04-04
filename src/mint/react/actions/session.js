import { REQUEST_SESSION, RECEIVE_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION, TOGGLE_ADDING } from '../constants/ActionTypes';
import { SubmissionError, reset } from 'redux-form';
import { changeModalComponent } from './modal';
import { fetchCart } from './cart';

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

export const toggleAddingToCart = () => ({
  type: TOGGLE_ADDING
});

export function update() {
  return async dispatch => {
    dispatch(request());

    try {
      const response = await fetch('/api/session', {
        credentials: 'same-origin'
      });
      return dispatch(receive(await response.json()));
    } catch (e) {
      throw 'error in session update';
    }
  };
}

export function signIn(cart_id, email, addingItem) {
  return async dispatch => {
    dispatch(requestUpdate());

    try {
      const response = await fetch(`/api/identify?cart_id=${cart_id}&email=${email}`, {
        credentials: 'same-origin'
      });

      dispatch(fetchCart(cart_id));
      dispatch(reset('SignIn'));

      addingItem
        ? dispatch(changeModalComponent('AmazonFormContainer'))
        : dispatch(changeModalComponent(null));

      return dispatch(receiveUpdate(await response.json()));
    } catch (e) {
      return new SubmissionError({ email: 'You are already signed in, check your email!' });
    }
  };
}
