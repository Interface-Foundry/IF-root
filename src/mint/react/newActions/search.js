import { get, post } from './async';

export const selectItem = item_id => ({
  type: 'SELECT_ITEM',
  response: {
    selectedItemId: item_id
  }
})

export const toggleHistory = () => ({
	type: 'TOGGLE_HISTORY'
})

export const updateQuery = query => ({
  type: 'UPDATE_QUERY',
  response: {
    query,
    history: true
  }
})

export const submitQuery = (query, store, locale) => get(
  `/api/itempreview?q=${query}&store=${store}&store_locale=${locale}`, 
  'SEARCH',
  (type, json) => ({
    type: `${type}_SUCCESS`,
    response: {
      results: [...json],
      history: false
    },
    receivedAt: Date.now()
  })
)
