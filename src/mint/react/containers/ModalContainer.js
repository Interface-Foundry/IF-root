// react/containers/ModalContainer.js

import { connect } from 'react-redux';
import { Modal } from '../components';

const mapStateToProps = (state, ownProps) => ({
  showYpoCheckout: state.app.showYpoCheckout
});

export default connect(mapStateToProps)(Modal);
