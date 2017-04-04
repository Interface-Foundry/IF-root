import { connect } from 'react-redux';
import { Item } from '../components';

import { getMemberById } from '../reducers';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  leader: state.cart.leader,
  member: getMemberById(state.cart, {id: state.cart.item.added_by}),
  addingItem: state.cart.addingItem,
  item: state.cart.item
});

export default connect(mapStateToProps)(Item);
