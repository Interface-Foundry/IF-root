import { connect } from 'react-redux';
import Modal from '../components/Modal';

import { get } from '../actions';

const mapStateToProps = (state, props) => ({
  	currentUser: state.auth.user_account
})

const mapDispatchToProps = dispatch => ({
    get: (url, type) => dispatch(get(url, type))
})

export default connect(mapStateToProps, mapDispatchToProps)(Modal);

