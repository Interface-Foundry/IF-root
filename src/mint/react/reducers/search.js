// react/reducers/cards.js

const initialState = { 
  selectedItemId: '',
  history: false,
  results: [], 
  categories: [],
  query: '' 
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'CATEGORIES_SUCCESS':
    case 'SEARCH_SUCCESS':
    case 'SELECT_ITEM':
    case 'UPDATE_QUERY':
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
