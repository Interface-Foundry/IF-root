// react/reducers/cards.js

const initialState = { 
  search: false,
  history: false,
  results: [], 
  query: '' 
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        ...action.response,
        search: true
      }
    case 'UPDATE_QUERY':
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
