// mint/react/components/View/Cart/Cart.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ItemPaidButton extends Component {

  static propTypes = {
    user: PropTypes.object,
    goToInvoice: PropTypes.func,
    selectAccordion: PropTypes.func,
    cart: PropTypes.object,
    userPaid: PropTypes.bool,
    displayInvoice: PropTypes.bool,
    isLeader: PropTypes.bool,
    splitType: PropTypes.string,
    invoiceId: PropTypes.string,
    fetchPaymentStatus: PropTypes.func,
    userCost: PropTypes.number
  }

  componentWillReceiveProps = ({ fetchPaymentStatus, invoiceId, userCost, displayInvoice }) =>
    (invoiceId && displayInvoice === this.props.displayInvoice && !userCost) ? fetchPaymentStatus(invoiceId) : null;

  render = () => {
    const { goToInvoice, cart, selectAccordion, userPaid, displayInvoice, splitType, isLeader } = this.props;
    if (!displayInvoice || (splitType === 'split_single' && !isLeader)) return null;
    else return (
      userPaid
      ? (
        <div className='pay-button paid'>
          <button disabled> ✔︎ Paid! </button>
        </div>
      ) : (
        <div className='pay-button unpaid'>
          <button onClick={()=> {goToInvoice(cart.id); selectAccordion('payments');}}> Pay Now </button>
        </div>
      )
    );
  }
}