import { connect } from 'react-redux';
import { Cart } from '../components';
import { fetchDeals } from '../actions/deals';
import { selectItem } from '../actions/cart';
import { splitCartById } from '../reducers';

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: state.currentCart.cart_id,
    addingItem: state.currentCart.addingItem,
    leader: state.currentCart.leader,
    members: state.currentCart.members,
    user_accounts: state.session.user_accounts,
    items: splitCartById(state, state.session.user_accounts[0]),
    carts: state.otherCarts.carts
  };
};

const mapDispatchToProps = dispatch => ({
  fetchDeals: () => dispatch(fetchDeals()),
  selectItem: item => dispatch(selectItem(item)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
