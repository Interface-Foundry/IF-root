import { connect } from 'react-redux';
import { Item } from '../components';
import { previewItem, clearItem, addItem } from '../actions/item';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  addingItem: state.cart.addingItem,
  item_id: ownProps.match.params.item_id,
  item: state.item
});

const mapDispatchToProps = dispatch => ({
  addItem: (cart_id, item_id, replace) => {
    dispatch(addItem(cart_id, item_id))
      .then(e => {
        replace(`/cart/${cart_id}/`);
      });
  },
  previewItem: (itemId) => dispatch(previewItem(itemId)),
  clearItem: () => dispatch(clearItem())
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);