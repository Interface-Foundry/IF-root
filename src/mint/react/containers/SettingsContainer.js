// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Settings } from '../components';
import { updateUser } from '../actions';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart.present,
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  updateUser: (id, user) => {
    ReactGA.event({
      category: 'Person',
      action: 'Edited Info'
    });
    return dispatch(updateUser(id, user));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
