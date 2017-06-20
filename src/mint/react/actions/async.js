import { loading } from './';

export const get = (url, type, cb) => {
  return async dispatch => {
    dispatch(loading(type));
    try {
      dispatch(loading(type));
      const response = await fetch(url, {
        credentials: 'same-origin'
      });

      return dispatch(cb(type, await response.json()));
    } catch (error) {
      return dispatch({
        type: `${type}_FAIL`,
        error: error.err
      });
    }
  };
};

export const post = (url, type, item, cb) => {
  return async dispatch => {
    dispatch(loading(type, item));
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
      return dispatch(cb(type, await response.json()));
    } catch (error) {
      return dispatch({
        type: `${type}_FAIL`,
        error: error.err
      });
    }
  };
};

export const put = (url, type, item, cb) => {
  return async dispatch => {
    dispatch(loading(type, item));
    try {
      const response = await fetch(url, {
        'method': 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        'body': JSON.stringify(item)
      });
      return dispatch(cb(type, await response.json()));
    } catch (error) {
      return dispatch({
        type: `${type}_FAIL`,
        error: error.err
      });
    }
  };
};

export const del = (url, type, cb) => {
  return async dispatch => {
    dispatch(loading(type));
    try {
      await fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      return dispatch(cb(type));
    } catch (error) {
      return dispatch({
        type: `${type}_FAIL`,
        error: error.err
      });
    }
  };
};
