import { connect } from 'react-redux';
import { Item } from '../components';
import { fetchDeals } from '../actions/deals';
import { previewItem, clearItem, previewAmazonItem, removeItem, incrementItem, decrementItem, nextSearch, prevSearch, setSearchIndex } from '../actions/item';

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
  items: ownProps.match.params.item_type === 'deal' ? state.deals.deals : state.currentCart.items,
  routing: state.routing
});

const mapDispatchToProps = dispatch => ({
  fetchDeals: () => dispatch(fetchDeals()),
  previewItem: (itemId) => dispatch(previewItem(itemId)),
  previewAmazonItem: (amazonId) => dispatch(previewAmazonItem(amazonId)),
  clearItem: () => dispatch(clearItem()),
  removeItem: (cart_id, item_id) => dispatch(removeItem(cart_id, item_id)),
  incrementItem: (item_id, quantity) => dispatch(incrementItem(item_id, quantity)),
  decrementItem: (item_id, quantity) => dispatch(decrementItem(item_id, quantity)),
  nextSearch: () => dispatch(nextSearch()),
  prevSearch: () => dispatch(prevSearch()),
  setSearchIndex: (index) => dispatch(setSearchIndex(index))
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);
