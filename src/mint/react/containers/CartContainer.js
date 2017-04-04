import { connect } from 'react-redux';
import { Cart } from '../components';

import { selectItem } from '../actions/cart';
import { changeModalComponent } from '../actions/modal';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  leader: state.cart.leader,
  members: state.cart.members,
  items: state.cart.items
});

const mapDispatchToProps = dispatch => ({
  selectItem: item => dispatch(selectItem(item)),
  changeModalComponent: (componentName) => dispatch(changeModalComponent(componentName))
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
