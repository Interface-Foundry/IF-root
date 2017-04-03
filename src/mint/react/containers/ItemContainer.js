import { connect } from 'react-redux';
import { Item } from '../components';

import { changeModalComponent } from '../actions/modal';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  leader: state.cart.leader,
  members: state.cart.members,
  items: state.cart.items,
  addingItem: state.cart.addingItem,
  item: state.cart.item
});

const mapDispatchToProps = dispatch => ({
  changeModalComponent: (componentName) => dispatch(changeModalComponent(componentName))
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);
