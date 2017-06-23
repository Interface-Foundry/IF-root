// react/reducers/cards.js

const initialState = {
  selectedItemId: '',
  history: false,
  results: [],
  categories: [],
  page: 0,
  query: '',
  loading: false
};

export default (state = initialState, action) => {
  let itemIndex;
  switch (action.type) {
  case 'SELECT_ITEM':
  case 'UPDATE_QUERY':
    return {
      ...state,
      ...action.response
    };
  case 'ITEM_SUCCESS':
  case 'SEARCH_SUCCESS':
  case 'CATEGORIES_SUCCESS':
  case 'UPDATE_QUERY':
    return {
      ...state,
      ...action.response,
      loading: false
    };
  case 'UPDATE_ITEM_SUCCESS':
    return {
      ...state,
      selectedItemId: action.response.item.id,
      results: state.results.reduce((acc, item, i) => {
        item.asin === action.response.item.asin ? acc.push(action.response.item) : acc.push(item);
        return acc;
      }, [])
    };
  case 'SELECT_ITEM_LEFT':
    itemIndex = state.results.findIndex((item) => {
      return item.id === state.selectedItemId;
    });
    return {
      ...state,
      selectedItemId: itemIndex === 0 ? null : state.results[itemIndex - 1].id
    };
  case 'SELECT_ITEM_RIGHT':
    itemIndex = state.results.findIndex((item) => {
      return item.id === state.selectedItemId;
    });

    return {
      ...state,
      selectedItemId: itemIndex === state.results.length - 1 ? null : state.results[itemIndex + 1].id
    };
  case 'TOGGLE_HISTORY':
    return {
      ...state,
      history: !state.history
    };
  case 'LAZY_SEARCH_LOADING':
  case 'SEARCH_LOADING':
    return {
      ...state,
      loading: true
    };
  case 'LAZY_SEARCH_SUCCESS':
    return {
      ...state,
      results: [...state.results, ...action.response.results],
      history: action.response.history,
      page: action.response.page,
      selectedItemId: action.response.selectedItemId,
      tab: action.response.tab,
      loading: false
    };
  default:
    return state;
  }
};
