import { CHANGE_KIPFORM_VIEW, RECEIVE_ADD_ITEM_TO_CART, TOGGLE_ANIMATION, TOGGLE_SHOW_SIBLINGS, RECEIVE_UPDATE_SESSION } from '../constants/ActionTypes';

const initialState = {
  currentView: 0,
  animation: true,
  showSiblings: true
};

export default function kipForm(state = initialState, action) {
  switch (action.type) {
  case CHANGE_KIPFORM_VIEW:
    return {
      ...state,
      currentView: action.view
    };
  case TOGGLE_ANIMATION:
    return {
      ...state,
      animation: !state.animation
    };
  case TOGGLE_SHOW_SIBLINGS:
    return {
      ...state,
      showSiblings: !state.showSiblings
    };
  case RECEIVE_UPDATE_SESSION:
    return {
      ...state,
      currentView: 2
    };
  case RECEIVE_ADD_ITEM_TO_CART:
    return {
      ...state,
      currentView: 0
    };
  default:
    return state;
  }
}
