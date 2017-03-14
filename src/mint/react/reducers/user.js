const initialState = {
  email_address: '',
  sessions: [],
  cart_leader: [],
  cart_member: []
};

function user(state = initialState, action) {
  // For now, don't handle any actions
  // and just return the state given to us.
  state.type = state.type ? state.type : 'TEST_TYPE';
  return state;
}
export default user;
