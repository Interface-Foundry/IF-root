import { connect } from 'react-redux';
import { addingItem } from '../actions/cart';
import { AddAmazonItem } from '../components';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  numUserItems: state.cart.currentCart.items.filter(item => item.added_by === (state.session.user_accounts[0] || false))
    .length,
  user_accounts: state.session.user_accounts
});

const mapDispatchToProps = dispatch => ({
  addingItem: (bool) => dispatch(addingItem(bool))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddAmazonItem);
