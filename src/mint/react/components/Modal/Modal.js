// react/components/Modal/Modal.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { YpoCheckoutContainer, AddressFormContainer, CheckoutModalContainer } from '../../containers';
import { Icon } from '../../../react-common/components';

export default class Modal extends Component {
  static propTypes = {
    showYpoCheckout: PropTypes.bool,
    showAddressForm: PropTypes.bool,
    showCheckoutModal: PropTypes.bool,
    closeYpo: PropTypes.func,
    closeAddress: PropTypes.func,
    closeCheckout: PropTypes.func
  }

  state = {
    showModal: false
  }

  _closeModal = () => {
    const { closeYpo, closeAddress, closeCheckout } = this.props;
    closeYpo();
    closeAddress();
    closeCheckout();
  }

  // for more modals we can just do an or
  // e.g. {showModal: showYpoCheckout || showAmazonCheckout || ...}
  componentWillReceiveProps = ({ showYpoCheckout, showAddressForm, showCheckoutModal }) =>
    this.setState({ showModal: showYpoCheckout || showAddressForm || showCheckoutModal });

  componentDidMount = () =>
    this.setState({ showModal: this.props.showYpoCheckout || this.props.showAddressForm || this.props.showCheckoutModal })

  shouldComponentUpdate = (_, { showModal }) =>
    showModal !== this.state.showModal

  render = () =>
    this.state.showModal
    ? (
      <div className='modal-overlay' onClick={this._closeModal}>
        { this.props.showYpoCheckout ? <YpoCheckoutContainer close={this._closeModal} /> : null }
        { this.props.showAddressForm ? <AddressFormContainer close={this._closeModal} /> : null }
        { this.props.showCheckoutModal ? <CheckoutModalContainer close={this._closeModal} /> : null }
      </div>
    )
    : null
}