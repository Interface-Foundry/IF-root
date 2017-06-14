// react/containers/SettingsContainer.js

import { connect } from 'react-redux';
import { Settings } from '../newComponents';
import { updateUser } from '../newActions';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart: state.cart,
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
