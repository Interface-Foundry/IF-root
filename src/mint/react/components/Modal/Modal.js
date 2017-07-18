// react/components/Modal/Modal.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { YpoCheckoutContainer, AddressFormContainer } from '../../containers';


export default class Modal extends Component {
  static propTypes = {
    showYpoCheckout: PropTypes.bool,
    showAddressForm: PropTypes.bool
  }

  state = {
    showModal: false
  }

  // for more modals we can just do an or
  // e.g. {showModal: showYpoCheckout || showAmazonCheckout || ...}
  componentWillReceiveProps = ({ showYpoCheckout, showAddressForm }) =>
    this.setState({ showModal: showYpoCheckout || showAddressForm });

  componentDidMount = () =>
    this.setState({ showModal: this.props.showYpoCheckout || this.props.showAddressForm })

  shouldComponentUpdate = (_, { showModal }) =>
    showModal !== this.state.showModal

  render = () =>
    this.state.showModal
    ? (
      <div className='modal-overlay'>
            <div className='modal-box'>
              <div className='modal-box__head'/>
              <div className='modal-box__content'>
                { this.props.showYpoCheckout ? <YpoCheckoutContainer /> : null }
                { this.props.showAddressForm ? <AddressFormContainer /> : null }
              </div>
          </div>
        </div>
    )
    : null
}