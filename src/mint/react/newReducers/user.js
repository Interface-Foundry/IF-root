// react/reducers/session.js

export default (state = {}, action) => {
  switch (action.type) {
  case 'LOGOUT':
    return {};
  case 'UPDATE_USER_SUCCESS':
  case 'CODE_SUCCESS':
  case 'SESSION_SUCCESS':
    return {
      ...state,
      ...action.response.user_account
    };
  default:
    return state;
  }
};
