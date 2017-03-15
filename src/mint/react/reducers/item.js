const initialState = {
  original_link: '',
  item_name: '',
  asin: '',
  cart: '',
  added: true
};

function item(state = initialState, action) {
  // For now, don't handle any actions
  // and just return the state given to us.
  state.type = state.type ? state.type : 'TEST_TYPE';
  return state;
}

export default item;
