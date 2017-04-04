import { connect } from 'react-redux';
import { App } from '../components';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  leader: state.cart.leader,
  newAccount: state.session.newAccount
});

export default connect(mapStateToProps)(App);
