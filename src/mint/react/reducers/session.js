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
  switch (action.type) {
    case RECEIVE_SESSION:
    case RECEIVE_UPDATE_SESSION:
      return Object.assign({}, state, action);
    case REQUEST_SESSION:
    case REQUEST_UPDATE_SESSION:
    default:
      return state;
  }
}
