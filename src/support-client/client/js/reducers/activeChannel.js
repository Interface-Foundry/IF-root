import { CHANGE_CHANNEL } from '../constants/ActionTypes';

const initialState = {
  name: 'Lobby',
  id: 0,
  resolved: false
};

export default function activeChannel(state = initialState, action) {
  switch (action.type) {
  case CHANGE_CHANNEL:
    return {
      name: action.channel.name,
      id: action.channel.id,
      resolved: action.channel.resolved
    };
  default:
    return state;
  }
}
