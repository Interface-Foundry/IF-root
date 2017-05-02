import { connect } from 'react-redux';
import Sidenav from '../components/Sidenav';

import { shuffleItems } from '../actions/hero';

const mapStateToProps = (state, props) => ({
  	myCarts: state.auth.myCarts,
  	otherCarts: state.auth.otherCarts,
  	currentUser: state.auth.user_account
})

export default connect(mapStateToProps)(Sidenav);
