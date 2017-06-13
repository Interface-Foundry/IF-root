// react/reducers/session.js

export default function session(state = {}, action) {
  switch (action.type) {
  case 'LOGOUT':
    return {};
  case 'SESSION_SUCCESS':
    return {
      ...state,
      ...action.response
    };
  default:
    return state;
  }
}
