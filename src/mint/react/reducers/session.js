import { 
  RECEIVE_SESSION, 
  REQUEST_SESSION, 
  REQUEST_UPDATE_SESSION, 
  RECEIVE_UPDATE_SESSION 
} from '../constants/ActionTypes';

const initialState = {
  user_accounts: [],
  animal: '',
  createdAt: '',
  updatedAt: '',
  id: ''
};

export default function session(state = initialState, action) {
  switch (action.type) {
    case RECEIVE_SESSION:
      return {
        ...state,
        ...action.newSession
      };
    case RECEIVE_UPDATE_SESSION:
      const { user, ...newSession } = action.newSession;
      return {
        ...state,
        ...newSession,
        user_accounts: newSession.newAccount ? [...state.user_accounts, user] : state.user_accounts
      };
    case REQUEST_SESSION:
    case REQUEST_UPDATE_SESSION:
    default:
      return state;
    }
}

// selectors
export const getAccountById = (state, props) => state.user_accounts.find(account => account.id === props.id)