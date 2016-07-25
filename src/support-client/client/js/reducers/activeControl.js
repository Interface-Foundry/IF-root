import { CHANGE_CONTROL } from '../constants/ActionTypes';

const initialState = {
  name: 'Default',
  id: 0
};

export default function activeControl(state = initialState, action) {
  switch (action.type) {
  case CHANGE_CONTROL:
    return {
       name: action.control.name,
       id: action.control.id
    }
  default:
    return state;
  }
}
