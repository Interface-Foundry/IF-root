import { SubmissionError } from 'redux-form';

export const logout = () => async dispatch => {
  dispatch({ type: 'LOGOUT' });
};

export const get = (url, type) => async dispatch => {
  try {

    const response = await fetch(url, {
      credentials: 'same-origin'
    });

    const json = await response.json();

    dispatch({
      type: `${type}_SUCCESS`,
      response: json,
      receivedAt: Date.now()
    });

  } catch (e) {
    throw 'error in session update';
  }
};

export function login(cart_id, email) {
  return async dispatch => {
    try {
      const response = await fetch(`/api/login?email=${encodeURIComponent(email)}&redirect=/cart/${cart_id}`, {
        credentials: 'same-origin'
      });
      const json = await response.json();
      return dispatch({
        type: json.newAccount ? 'SESSION_SUCCESS' : 'LOGIN_SUCCESS',
        response: json,
        receivedAt: Date.now()
      });
    } catch (e) {
      return new SubmissionError({ email: 'Something went wrong with login' });
    }
  };
}

export function getSiteState(loc = '') {
  console.log({ loc });
  return async dispatch => {
    try {
      const site = await fetch('/api/home/json', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify({ loc })
        })
        .then(json => json.json());
      return dispatch({
        type: 'GOT_SITE',
        response: site,
        receivedAt: Date.now()
      });
    } catch (e) {
      throw 'Error getting site state';
    }
  };
}

export function validateCode(email, code) {
  return async dispatch => {
    try {
      const response = await fetch(`/auth/quick/${code}`, {
        'method': 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        'body': JSON.stringify({ email })
      });
      return dispatch({
        type: 'SESSION_SUCCESS',
        response: await response.json(),
        receivedAt: Date.now()
      });
    } catch (e) {
      return new SubmissionError({ ok: false, message: 'That code didn\'t work, try again?' });
    }
  };
}

export const scrollToPosition = (scrollTo, scrollFrom = 0) =>
  async dispatch => {
    let scrollPos = scrollFrom;
    const interval = setInterval(() => {
        if (scrollTo - scrollPos < 6) {
          clearInterval(interval);
          dispatch({
            type: 'HANDLE_SCROLL',
            response: {
              scrollTo,
              fixed: scrollPos > 2
            }
          });
        } else {
          scrollPos = scrollPos + 10;
          dispatch({
            type: 'HANDLE_SCROLL',
            response: {
              scrollTo: scrollPos,
              fixed: scrollPos > 2
            }
          });
        }
      },
      1);
  };
