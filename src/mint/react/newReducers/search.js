// react/reducers/cards.js

const initialState = { 
  selectedItemId: 0,
  history: false,
  results: [], 
  query: '' 
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SELECT_ITEM':
    case 'UPDATE_QUERY':
      return {
        ...state,
        ...action.response
      };
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        ...action.response
      };
    case 'TOGGLE_HISTORY':
      return {
        ...state,
        history: !state.history
      };
    default:
      return state;
  }
};
