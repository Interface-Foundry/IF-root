import { connect } from 'react-redux';
import Landing from '../components/Landing';
import { get } from '../actions';

const mapStateToProps = (state, props) => ({
  name: state.auth.user_account ? state.auth.user_account.name : '',
});

const mapDispatchToProps = dispatch => ({
  updateCarts: () => dispatch(get('/api/carts', 'CARTS'))
});

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
