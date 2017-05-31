// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { App } from '../newComponents';

import { 
  toggleSidenav,
  togglePopup
} from '../actions';

import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: state.cart.cart_id,
    sidenav: state.app.sidenav,
    popup: state.app.popup
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);




