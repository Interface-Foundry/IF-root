// react/components/Modal/YPOCheckout/YPOCheckout.js
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../../react-common/components';
import { displayCost } from '../../../utils';

export default class YPOCheckout extends Component {
  static propTypes = {
    total: PropTypes.number,
    locale: PropTypes.string,
    orderNumber: PropTypes.string,
    accountNumber: PropTypes.string,
    deliveryMessage: PropTypes.string,
    voucherCode: PropTypes.string,
    cartId: PropTypes.string,
    submitYpoData: PropTypes.func,
    toggleYpoCheckout: PropTypes.func
  }

  state = {
    accountNumber: '',
    orderNumber: '',
    deliveryMessage: '',
    voucherCode: ''
  }

  _updateAccountNumber = (e) => this.setState({ accountNumber: e.target.value })
  _updateOrderNumber = (e) => this.setState({ orderNumber: e.target.value })
  _updateVoucherCode = (e) => this.setState({ voucherCode: e.target.value })
  _updateDeliveryMessage = (e) => this.setState({ deliveryMessage: e.target.value })

  _handleSubmit = (e) => {
    const { props: { submitYpoData, cartId }, state: { orderNumber, accountNumber, deliveryMessage, voucherCode } } = this;
    e.preventDefault();
    submitYpoData({ cartId, orderNumber, accountNumber, deliveryMessage, voucherCode })
      .then(() => window.location = `/api/cart/${cartId}/checkout`); // ¯\_(ツ)_/¯
  }

  componentWillReceiveProps = ({ orderNumber = '', accountNumber = '', deliveryMessage = '', voucherCode = '' }) => 
    this.setState({ orderNumber, accountNumber, deliveryMessage, voucherCode });
  

  componentDidMount() {
    const { orderNumber = '', accountNumber = '', deliveryMessage = '', voucherCode = '' } = this.props;
    this.setState({ orderNumber, accountNumber, deliveryMessage, voucherCode });
  }

  render = () => {
    const { props: { total, locale, toggleYpoCheckout }, _updateAccountNumber, _updateOrderNumber, _updateVoucherCode, _updateDeliveryMessage, state: { accountNumber, orderNumber, deliveryMessage, voucherCode } } = this;

    return (
      <div className='ypo-checkout'>
        <a className='close' href='#' onClick={(e)=>{e.preventDefault(); toggleYpoCheckout(false);}}><Icon icon='Clear'/></a>
        <h1>Last Step!</h1>
        <p>Before you check out, we need a couple details from your YPO Account 😊</p>
        <form onSubmit={::this._handleSubmit}>
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
          
          <button type='submit'>
            <div>
              <Icon icon='Cart'/>
              <span>{displayCost(total, locale)}</span>
            </div>
            <div>
              <span>Checkout</span>
              <Icon icon='RightChevron'/>
            </div>
          </button>
        </form>
      </div>
    );
  }
}
