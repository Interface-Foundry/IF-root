// react/reducers/cards.js

const initialState = { 
  history: false,
  results: [], 
  query: '' 
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_QUERY':
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        ...action.response
      }
    case 'TOGGLE_HISTORY':
      return {
        ...state,
        history: !state.history
      }
    default:
      return state;
  }
}
