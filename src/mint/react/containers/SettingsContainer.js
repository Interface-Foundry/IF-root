// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Settings } from '../components';
import { selectDeal } from '../actions/deals';

const mapStateToProps = (state, ownProps) => ({
	cart_id: state.currentCart.cart_id,
	currentCart: state.currentCart,
	currentUser: state.session.user_account
});

const mapDispatchToProps = dispatch => ({
  selectDeal: (dealIndex) => dispatch(selectDeal(dealIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
