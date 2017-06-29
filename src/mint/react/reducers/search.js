// react/reducers/cards.js

const initialState = {
  selectedItemId: '',
  lastUpdatedId: null,
  history: false,
  results: [],
  categories: [],
  page: 0,
  query: '',
  loading: false,
  lazyLoading: false
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
  case 'SEARCH_SUCCESS':
    return {
      ...state,
      ...action.response,
      loading: false
    };
  case 'CATEGORIES_SUCCESS':
    return {
      ...state,
      ...action.response
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
    return {
      ...state,
      lazyLoading: true
    };
  case 'SEARCH_LOADING':
    return {
      ...state,
      results: [],
      loading: true
    };
  case 'LAZY_SEARCH_SUCCESS':
    return {
      ...state,
      results: [...state.results, ...action.response.results],
      history: action.response.history,
      page: action.response.page,
      tab: action.response.tab,
      lazyLoading: false
    };
  case 'SEARCH_ITEM_SUCCESS':
    return {
      ...state,
      lastUpdatedId: action.response.item.id,
      results: state.results.reduce((acc, item, i) => {
        item.id === action.response.item.id ? acc.push({ ...item, ...action.response.item }) : acc.push(item);
        return acc;
      }, [])
    };
  case 'ITEM_OPTION_SUCCESS':
    return {
      ...state,
      lastUpdatedId: action.response.item.id,
      selectedItemId: action.response.item.id,
      results: state.results.reduce((acc, item, i) =>
        item.id === state.selectedItemId
        ? [...acc, {
          ...item,
          ...action.response.item,
          options: item.options.map(option => ({ ...option, selected: option.asin === action.response.item.asin }))
        }]
        : [...acc, item], [])
    };
  default:
    return state;
  }
};
