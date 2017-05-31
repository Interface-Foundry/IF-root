import { loading, notify } from './'

export const get = (url, type) => {
  loading(type)
  return async dispatch => {
    try {
      const response = await fetch(url, {
        credentials: 'same-origin'
      });

      return dispatch({
        type: `${type}_SUCCESS`,
        response: await response.json(),
        receivedAt: Date.now()
      })
    } catch (error) {
      return dispatch({
        type: `${type}_FAIL`,
        error: error.err
      })
    }
  };
}

export const post = (url, type, item) => {
  loading(type)
  return async dispatch => {
    try {
      const response = await fetch(url, {
        'method': 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        'body': JSON.stringify(item)
      });
      return dispatch({
        type: `${type}_SUCCESS`,
        response: await response.json(),
        receivedAt: Date.now()
      })
    } catch (error) {
      return dispatch({
        type: `${type}_FAIL`,
        error: error.err
      })
    }
  };
}