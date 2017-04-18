import { connect } from 'react-redux';
import { Item } from '../components';
import { fetchDeals } from '../actions/deals';
import { previewItem, clearItem, previewAmazonItem, removeItem, incrementItem, decrementItem } from '../actions/item';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  addingItem: state.currentCart.addingItem,
  item_id: ownProps.match.params.item_id,
  amazon_id: ownProps.match.params.amazon_id,
  item: state.item,
  index: parseInt(ownProps.match.params.index),
  type: ownProps.match.params.item_type,
  items: ownProps.match.params.item_type === 'deal' ? state[`${ownProps.match.params.item_type}s`][`${ownProps.match.params.item_type}s`] : state.currentCart.items
});

const mapDispatchToProps = dispatch => ({
  fetchDeals: () => dispatch(fetchDeals()),
  previewItem: (itemId) => dispatch(previewItem(itemId)),
  previewAmazonItem: (amazonId) => dispatch(previewAmazonItem(amazonId)),
  clearItem: () => dispatch(clearItem()),
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id)),
  incrementItem: (item_id, quantity) => dispatch(incrementItem(item_id, quantity)),
  decrementItem: (item_id, quantity) => dispatch(decrementItem(item_id, quantity)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);