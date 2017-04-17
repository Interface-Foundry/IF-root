import { connect } from 'react-redux';
import { Item } from '../components';
import { fetchDeals } from '../actions/deals';
import { previewItem, clearItem } from '../actions/item';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  addingItem: state.currentCart.addingItem,
  item_id: ownProps.match.params.item_id,
  item: state.item,
  index: ownProps.match.params.index,
  type: ownProps.match.params.item_type,
  items: ownProps.match.params.item_type === 'deal' ? state[`${ownProps.match.params.item_type}s`][`${ownProps.match.params.item_type}s`] : null
});

const mapDispatchToProps = dispatch => ({
  fetchDeals: () => dispatch(fetchDeals()),
  previewItem: (itemId) => dispatch(previewItem(itemId)),
  clearItem: () => dispatch(clearItem())
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);
