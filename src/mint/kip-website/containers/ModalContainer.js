import { connect } from 'react-redux';
import Modal from '../components/Modal';

import { 
	get,
	toggleModal
} from '../actions';

const mapStateToProps = (state, props) => ({
  	currentUser: state.auth.user_account
})

const mapDispatchToProps = dispatch => ({
    get: (url, type) => dispatch(get(url, type)),
    toggleModal: () => dispatch(toggleModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(Modal);

