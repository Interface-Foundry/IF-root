import { connect } from 'react-redux';
import { Item } from '../components';

import { addItem } from '../actions/cart';
import { getMemberById } from '../reducers';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  leader: state.cart.leader,
  member: getMemberById(state.cart, {id: state.item.added_by}),
  addingItem: state.cart.addingItem,
  item: state.item
});

const mapDispatchToProps = dispatch => ({
  addItem: (cart_id, url, replace) => dispatch(addItem(cart_id, url)).then(e => {
  		replace(`/cart/${cart_id}`);
  	})
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);
