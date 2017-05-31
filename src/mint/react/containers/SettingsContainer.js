// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Settings } from '../components';
import { updateUser } from '../actions/session';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  currentCart: state.currentCart,
  user_account: state.session.user_account
});

const mapDispatchToProps = dispatch => ({
  updateUser: (id, user_account) => {
    ReactGA.event({
      category: 'Person',
      action: 'Edited Info',
    });
    return dispatch(updateUser(id, user_account));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
