// react/components/Modal/YPOCheckout/YPOCheckout.js
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { ButtonsContainer } from '../../../containers';
import { Icon } from '../../../../react-common/components';

export default class YPOCheckout extends Component {
  static propTypes = {
    orderNumber: PropTypes.string,
    accountNumber: PropTypes.string,
    deliveryMessage: PropTypes.string,
    voucherCode: PropTypes.string,
    cart: PropTypes.object,
    submitYpoData: PropTypes.func,
    toggleYpoCheckout: PropTypes.func,
    leader: PropTypes.object,
    userId: PropTypes.string,
    close: PropTypes.func
  }

  state = {
    accountNumber: '',
    orderNumber: '',
    deliveryMessage: '',
    voucherCode: ''
  }

  _updateAccountNumber = e => this.setState({ accountNumber: e.target.value })
  _updateOrderNumber = e => this.setState({ orderNumber: e.target.value })
  _updateVoucherCode = e => this.setState({ voucherCode: e.target.value })
  _updateDeliveryMessage = e => this.setState({ deliveryMessage: e.target.value })

  _handleSubmit = e => {
    const { props: { submitYpoData, cart, leader, userId }, state: { orderNumber, accountNumber, deliveryMessage, voucherCode } } = this;
    e.preventDefault();
    submitYpoData({ cart, orderNumber, accountNumber, deliveryMessage, voucherCode, lock: leader.id === userId })
      .then(() => window.location = `/api/cart/${cart.id}/checkout`); // ¯\_(ツ)_/¯
  }

  componentWillReceiveProps = ({ orderNumber = '', accountNumber = '', deliveryMessage = '', voucherCode = '' }) =>
    this.setState({ orderNumber, accountNumber, deliveryMessage, voucherCode })

  componentDidMount = () => {
    const { orderNumber = '', accountNumber = '', deliveryMessage = '', voucherCode = '' } = this.props;
    this.setState({ orderNumber, accountNumber, deliveryMessage, voucherCode });
  }

  shouldComponentUpdate = (_, { accountNumber, orderNumber, deliveryMessage, voucherCode }) =>
    accountNumber !== this.state.accountNumber
    || orderNumber !== this.state.orderNumber
    || deliveryMessage !== this.state.deliveryMessage
    || voucherCode !== this.state.voucherCode

  render = () => {
    const {
      _updateAccountNumber,
      _updateOrderNumber,
      _updateVoucherCode,
      _updateDeliveryMessage,
      state: { accountNumber, orderNumber, deliveryMessage, voucherCode }
    } = this;

    return (
      <div className='modal-box' >
        <div className='modal-box__head'>
          <a className='close' href='#' onClick={this.props.close}><Icon icon='Clear'/></a>
          <p>Checkout</p>
        </div>

        <div className='modal-box__content ypo-checkout form-container' onClick={e => e.stopPropagation()}>
          <h1>Last Step!</h1>
          <p>Before you check out, we need a couple details from your YPO Account 😊</p>
          <form onSubmit={this._handleSubmit} id='ypo-checkout'>
            <label>
              <div>
                YPO Account Number <i>Required</i>
              </div>
              <span>
                <Icon icon='Member'/>
                <input type='number' placeholder='YPO Account Number' required value={accountNumber} onChange={_updateAccountNumber} />
                <span className='required'>﹡</span>
              </span>
            </label>

            <label>
              <div>
                Order Number <i>Optional</i>
              </div>
              <span>
                <Icon icon='Hash'/>
                <input type='number' placeholder='Order Number' value={orderNumber} onChange={_updateOrderNumber} />
              </span>
            </label>

            <label>
              <div>
                Delivery Message <i>Optional</i>
              </div>
              <span className='textarea'>
                <Icon icon='Chatbubble'/>
                <textarea rows='3'  placeholder='Delivery Message' value={deliveryMessage} onChange={_updateDeliveryMessage} />
              </span>
            </label>

            <label>
              <div>
                Voucher Code <i>Optional</i>
              </div>
              <span>
                <Icon icon='QR'/>
                <input type='number' placeholder='Voucher Code' value={voucherCode} onChange={_updateVoucherCode} />
              </span>
            </label>
          </form>
        </div>

        <div className='modal-box__footer ypo-buttons' onClick={e => e.stopPropagation()}>
          <ButtonsContainer checkoutOnly={true} checkoutFunc={this._handleSubmit} formId='ypo-checkout'/>
        </div>
      </div>
    );
  }
}