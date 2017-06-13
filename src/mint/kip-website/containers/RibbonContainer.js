import { connect } from 'react-redux';
import Ribbon from '../components/Ribbon';

import {
  toggleModal,
  toggleSidenav
} from '../actions';

const mapStateToProps = (state, props) => ({
  user_account: state.auth.user_account,
  fixed: state.app.fixed,
  ribbonTemplate: state.siteState.ribbon,
  src: sessionStorage.src
});

const mapDispatchToProps = dispatch => ({
  toggleModal: (loginText, loginSubtext) => dispatch(toggleModal(loginText, loginSubtext)),
  toggleSidenav: () => dispatch(toggleSidenav())
});

export default connect(mapStateToProps, mapDispatchToProps)(Ribbon);
