import { connect } from 'react-redux';
import Ribbon from '../components/Ribbon';

import { 	
	toggleModal,
	toggleSidenav 
} from '../actions';

const mapStateToProps = (state, props) => ({
  	user_account: state.auth.user_account,
  	fixed: state.app.fixed
})

const mapDispatchToProps = dispatch => ({
    toggleModal: () => dispatch(toggleModal()),
    toggleSidenav: () => dispatch(toggleSidenav())
})

export default connect(mapStateToProps, mapDispatchToProps)(Ribbon);
