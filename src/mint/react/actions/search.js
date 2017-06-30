import { get } from './async';

export const selectItem = item_id => ({
  type: 'SELECT_ITEM',
  response: {
    selectedItemId: item_id
  }
});

export const navigateRightResults = () => ({
  type: 'SELECT_ITEM_RIGHT'
});

export const navigateLeftResults = () => ({
  type: 'SELECT_ITEM_LEFT'
});

export const toggleHistory = show => ({
  type: 'TOGGLE_HISTORY',
  history: show
});

export const updateQuery = query => ({
  type: 'UPDATE_QUERY',
  response: {
    query,
    history: true
  }
});

export const getMoreSearchResults = (query, store, locale, page) => get(
  `/api/itempreview?q=${query}&page=${page}&store=${store}&store_locale=${locale}`,
  'LAZY_SEARCH',
  (type, json) => {
    return {
      type: `${type}_SUCCESS`,
      response: {
        results: json.asin ? [json] : [...json],
        history: false,
        page: page,
        tab: 'search'
      },
      receivedAt: Date.now()
    };
  }
);

export const submitQuery = (query, store, locale) => get(
  `/api/itempreview?q=${query}&store=${store}&store_locale=${locale}`,
  'SEARCH',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      results: json.asin ? [json] : [...json],
      history: false,
      page: 0,
      selectedItemId: json.id || (json.length === 1 ? json[0].id : null),
      tab: 'search'
    },
    receivedAt: Date.now()
  })
);

export const fetchCategories = cart_id => get(
  `/api/categories/${cart_id}`,
  'CATEGORIES',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      categories: json
    },
    receivedAt: Date.now()
  })
);
