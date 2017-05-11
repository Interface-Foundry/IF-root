// react/containers/ItemContainer.js

import { connect } from 'react-redux';
import { Item } from '../components';
import { fetchCards, selectCard } from '../actions/cards';
import { previewItem, clearItem, previewAmazonItem, removeItem, incrementItem, decrementItem, nextSearch, prevSearch, setSearchIndex, updateItem } from '../actions/item';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  addingItem: state.currentCart.addingItem,
  currentCart: state.currentCart,
  item_id: ownProps.match.params.item_id,
  amazon_id: ownProps.match.params.amazon_id,
  currentUser: state.session.user_account,
  item: state.item,
  index: parseInt(ownProps.match.params.index),
  type: ownProps.match.params.item_type,
  items: ownProps.match.params.item_type === 'deal' ? state.cards.cards : state.currentCart.items,
  routing: state.routing
});

const mapDispatchToProps = dispatch => ({
  fetchCards: () => dispatch(fetchCards()),
  previewItem: (itemId) => {
    ReactGA.event({
      category: 'Item',
      action: 'previewed item',
    });
    return dispatch(previewItem(itemId));
  },
  previewAmazonItem: (amazonId) => {
    ReactGA.event({
      category: 'Item',
      action: 'Item Added',
    });
    return dispatch(previewAmazonItem(amazonId));
  },
  clearItem: () => dispatch(clearItem()),
  removeItem: (cart_id, item_id) => {
    ReactGA.event({
      category: 'Item',
      action: 'Item Removed',
    });
    return dispatch(removeItem(cart_id, item_id));
  },
  incrementItem: (item_id, quantity) => dispatch(incrementItem(item_id, quantity)),
  decrementItem: (item_id, quantity) => dispatch(decrementItem(item_id, quantity)),
  nextSearch: () => dispatch(nextSearch()),
  prevSearch: () => dispatch(prevSearch()),
  selectCard: (cardIndex, card) => dispatch(selectCard(cardIndex, card)),
  setSearchIndex: (index) => dispatch(setSearchIndex(index)),
  updateItem: (cart_id, old_item_id, new_item_id) => dispatch(updateItem(cart_id, old_item_id, new_item_id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);
