import { NEW_TYPE, RECEIVE_SESSION, REQUEST_SESSION, REQUEST_UPDATE_SESSION, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';
const initialState = {
  user_accounts: [],
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: '',
  type: NEW_TYPE
};

export default function session(state = initialState, action) {
  console.log('state', state, 'action', action)
  switch (action.type) {
    case RECEIVE_SESSION:
      return Object.assign({}, state, action);
    case RECEIVE_UPDATE_SESSION:
      console.log('returning', action.ok ? Object.assign({}, state, {
        user_accounts: [...state.user_accounts, action.user],
        newAccount: action.ok
      }) : Object.assign({}, state, {
        newAccount: state.ok
      }));
      return action.ok ? Object.assign({}, state, {
        user_accounts: [...state.user_accounts, action.user],
        newAccount: action.ok
      }) : Object.assign({}, state, {
        newAccount: action.ok
      });
    case REQUEST_SESSION:
    case REQUEST_UPDATE_SESSION:
    default:
      return state;
  }
}
