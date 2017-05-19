import { connect } from 'react-redux';
import Sidenav from '../components/Sidenav';

import { get, logout } from '../actions';

const mapStateToProps = (state, props) => ({
  	myCarts: state.auth.myCarts,
  	otherCarts: state.auth.otherCarts,
  	currentUser: state.auth.user_account
})

const mapDispatchToProps = dispatch => ({
    get: (url, type) => dispatch(get(url, type)),
    logout: () =>dispatch(logout())
})

export default connect(mapStateToProps, mapDispatchToProps)(Sidenav);

