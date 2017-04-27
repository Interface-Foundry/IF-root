// react/actions/session.js

import { REQUEST_SESSION, RECEIVE_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION, TOGGLE_ADDING } from '../constants/ActionTypes';
import { SubmissionError } from 'redux-form';

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

export function signIn(cart_id, email) {
  return async dispatch => {
    dispatch(requestUpdate());

    try {
      const response = await fetch(`/api/identify?cart_id=${cart_id}&email=${email}`, {
        credentials: 'same-origin'
      });

      return dispatch(receiveUpdate(await response.json()));
    } catch (e) {
      return new SubmissionError({ email: 'You are already signed in, check your email!' });
    }
  };
}


export function logout() {
  return async dispatch => {
    try {
      const response = await fetch(`/api/logout`, {
        credentials: 'same-origin'
      });

      return dispatch(receiveUpdate({
        user_account: {},
        animal: '',
        createdAt: '',
        updatedAt: '',
        id: ''
      }));
    } catch (e) {
      return new SubmissionError({ email: 'You are already signed in, check your email!' });
    }
  };
}

export function postFeedback(feedback) {
  return async dispatch => {
    try {
      const response = await fetch(`/api/feedback`, {
        'method': 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        'body': JSON.stringify(feedback)
      });
    } catch (e) {
      throw e;
    }
  };
}