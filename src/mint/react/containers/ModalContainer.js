// react/containers/ModalContainer.js

import { connect } from 'react-redux';
import { Modal } from '../components';
import { toggleAddressForm, toggleYpoCheckout, toggleCheckoutModal } from '../actions';

const mapStateToProps = (state, ownProps) => ({
  showYpoCheckout: state.app.showYpoCheckout,
  showAddressForm: state.app.showAddressForm,
  showCheckoutModal: state.app.showCheckoutModal
});

const mapDispatchToProps = dispatch => ({
  closeCheckout: () => dispatch(toggleCheckoutModal(false)),
  closeYpo: () => dispatch(toggleYpoCheckout(false)),
  closeAddress: () => dispatch(toggleAddressForm(false))
});

export default connect(mapStateToProps, mapDispatchToProps)(Modal);