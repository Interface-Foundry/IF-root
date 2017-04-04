import { CHANGE_MODAL_COMPONENT } from '../constants/ActionTypes';

const initialState = {
  component: null
};

export default function modal(state = initialState, action) {
  switch (action.type) {
    case CHANGE_MODAL_COMPONENT:
      return {
        ...state,
        component: action.componentName
      };
    default:
      return state;
  }
}
