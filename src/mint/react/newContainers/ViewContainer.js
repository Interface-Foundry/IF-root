// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { View } from '../newComponents';

import { 
  toggleSidenav,
  togglePopup
} from '../newActions';

import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => {
  return {
  	user: state.user,
    cart: state.cart,
    sidenav: state.app.sidenav,
    popup: state.app.popup
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav())
});

export default connect(mapStateToProps, mapDispatchToProps)(View);




