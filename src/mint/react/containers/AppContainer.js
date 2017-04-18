import { connect } from 'react-redux';
import { App } from '../components';
import { fetchCart, fetchAllCarts } from '../actions/cart';
import { addItem } from '../actions/item';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.routing.location.pathname.match(/cart\/((\d|\w)+)/)[1], // TODO: switch to nonregex when react router allows it
  leader: state.currentCart.leader,
  carts: state.otherCarts.carts,
  currentUser: state.session.user_accounts[0],
  newAccount: state.session.newAccount,
  deals: state.deals.deals,
  item: state.item,
  currentCart: state.currentCart,
  items: state.currentCart.items
});
const mapDispatchToProps = dispatch => ({
	addItem: (cart_id, item_id, replace) => {
    dispatch(addItem(cart_id, item_id))
      .then(e => {
        replace(`/cart/${cart_id}/`);
      });
  },
  fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
  fetchAllCarts: () => dispatch(fetchAllCarts())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
