// react/containers/ItemContainer.js

import { connect } from 'react-redux';
import { Item } from '../components';
import { fetchCards, selectCard } from '../actions/cards';
import { previewItem, clearItem, search, removeItem, incrementItem, decrementItem, nextSearch, prevSearch, setSearchIndex, saveOldId } from '../actions/item';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  addingItem: state.currentCart.addingItem,
  currentCart: state.currentCart,
  item_id: ownProps.match.params.item_id,
  amazon_id: ownProps.match.params.amazon_id,
  user_account: state.session.user_account,
  item: state.item,
  index: parseInt(ownProps.match.params.index),
  type: ownProps.match.params.item_type,
  items: ownProps.match.params.item_type === 'search' ? state.cards.cards : state.currentCart.items,
  routing: state.routing
});

const mapDispatchToProps = dispatch => ({
  fetchCards: (cart_id) => dispatch(fetchCards(cart_id)),
  previewItem: (itemId) => {
    ReactGA.event({
      category: 'Item',
      action: 'previewed item'
    });
    return dispatch(previewItem(itemId));
  },
  search: (amazonId, store, locale) => {
    ReactGA.event({
      category: 'Item',
      action: 'Item Added'
    });
    return dispatch(search(amazonId, store, locale));
  },
  clearItem: () => dispatch(clearItem()),
  removeItem: (cart_id, item_id) => {
    ReactGA.event({
      category: 'Item',
      action: 'Item Removed'
    });
    return dispatch(removeItem(cart_id, item_id));
  },
  incrementItem: (item_id, quantity) => dispatch(incrementItem(item_id, quantity)),
  decrementItem: (item_id, quantity) => dispatch(decrementItem(item_id, quantity)),
  nextSearch: () => dispatch(nextSearch()),
  prevSearch: () => dispatch(prevSearch()),
  selectCard: (cardIndex, card) => dispatch(selectCard(cardIndex, card)),
  setSearchIndex: (index) => dispatch(setSearchIndex(index)),
  saveOldId: (item_id) => dispatch(saveOldId(item_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);