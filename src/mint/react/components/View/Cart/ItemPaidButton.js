// mint/react/components/View/Cart/Cart.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ItemPaidButton extends Component {

  static propTypes = {
    user: PropTypes.object,
    goToInvoice: PropTypes.func,
    selectAccordion: PropTypes.func,
    cart: PropTypes.object,
    paid: PropTypes.bool,
    displayInvoice: PropTypes.bool,
    isLeader: PropTypes.bool,
    splitType: PropTypes.string
  }
  render() {
    const { goToInvoice, cart, selectAccordion, paid, displayInvoice, splitType, isLeader } = this.props;
    if (!displayInvoice || (splitType === 'split_single' && !isLeader)) return null;
    else return (
      paid
      ? (
        <div className='pay-button paid'>
          <button disabled> ✔︎ Paid! </button>
        </div>
      ) : (
        <div className='pay-button'>
          <button onClick={()=> {goToInvoice(cart.id); selectAccordion('payments');}}> Pay Now </button>
        </div>
      )
    );
  }
}