// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { View } from '../newComponents';

import { 
  toggleSidenav,
  togglePopup,
  selectTab
} from '../newActions';

import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => {
  return {
  	user: state.user,
    cart: state.cart,
    sidenav: state.app.sidenav,
    popup: state.app.popup,
    tab: state.app.viewTab
  };
};

const mapDispatchToProps = dispatch => ({
  togglePopup: () => dispatch(togglePopup()),
  toggleSidenav: () => dispatch(toggleSidenav()),
  selectTab: (tab) => dispatch(selectTab(tab))
});

export default connect(mapStateToProps, mapDispatchToProps)(View);




