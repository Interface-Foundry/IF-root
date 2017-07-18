// react/containers/ModalContainer.js

import { connect } from 'react-redux';
import { Modal } from '../components';

const mapStateToProps = (state, ownProps) => ({
  showYpoCheckout: state.app.showYpoCheckout,
  showAddressForm: state.app.showAddressForm
});

export default connect(mapStateToProps)(Modal);
