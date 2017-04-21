import { RECEIVE_DEALS, SELECT_DEAL, REMOVE_DEAL } from '../constants/ActionTypes';

const initialState = { deals: [], position: null };

export default function kipForm(state = initialState, action) {
  switch (action.type) {
  case RECEIVE_DEALS:
    return {
      ...state,
      deals: action.deals
    };
  case SELECT_DEAL:
  	return {
      ...state,
  		position: action.selectedIndex
  	}
  case REMOVE_DEAL:
    return {
      ...state,
      deals: _.filter(state.deals, (deal, index) => index !== action.selectedIndex),
      position: null
    }
  default:
    return state;
  }
}
