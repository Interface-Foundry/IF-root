// react/components/Modal/Modal.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { YpoCheckoutContainer } from '../../containers';

export default class Modal extends Component {
  static propTypes = {
    showYpoCheckout: PropTypes.bool
  }

  state = {
    showModal: false
  }

  // for more modals we can just do an or 
  // e.g. {showModal: showYpoCheckout || showAmazonCheckout || ...}
  componentWillReceiveProps = ({ showYpoCheckout }) =>
    this.setState({ showModal: showYpoCheckout })

  componentDidMount = () =>
    this.setState({ showModal: this.props.showYpoCheckout })
  shouldComponentUpdate = ({ showYpoCheckout }) =>
    showYpoCheckout !== this.state.showYpoCheckout

  render = () =>
    (
      this.state.showModal
      ? (
          <div className='modal-overlay'>
            <div className='modal-box'>
              <div className='modal-box__head'>
              </div>

              <div className='modal-box__content'>
                { this.props.showYpoCheckout ? <YpoCheckoutContainer /> : null }
              </div>
          </div>
        </div>)
      : null
    )

}
