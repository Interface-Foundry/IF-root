// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Payment from './Payment';
import InvoiceAddress from './InvoiceAddress';
import InvoiceInfo from './InvoiceInfo';
import CartReview from './CartReview';
import Forms from './Forms';

export default class Invoice extends Component {
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    selectedAccordion: PropTypes.string,
    fetchInvoiceByCart: PropTypes.func,
    tab: PropTypes.string,
    setTab: PropTypes.func
  }

  componentDidMount() {
    const { cart, fetchInvoiceByCart, tab, setTab } = this.props;
    if (tab !== 'invoice') setTab();
    fetchInvoiceByCart(cart.id);
  }

  componentWillReceiveProps = ({ cart, fetchInvoiceByCart }) =>
    (cart.id !== this.props.cart.id) ? fetchInvoiceByCart(cart.id) : null

  render() {
    const { selectedAccordion, user, cart } = this.props;
    const isLeader = user.id === cart.leader.id || user.id === cart.leader;
    return (
      <div className='invoice'>
        { selectedAccordion.includes('form') ? <Forms {...this.props}/> : null}
        <InvoiceInfo {...this.props} />
        <InvoiceAddress {...this.props} isLeader={isLeader}/>
        <Payment {...this.props} isLeader={isLeader}/>
        <CartReview {...this.props} isLeader={isLeader}/>
      </div>
    );
  }
}