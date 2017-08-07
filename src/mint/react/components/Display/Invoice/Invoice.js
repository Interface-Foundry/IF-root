// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Payment from './Payment';
import InvoiceAddress from './InvoiceAddress';
import InvoiceInfo from './InvoiceInfo';
import Shipping from './Shipping';
import Forms from './Forms';

export default class Invoice extends Component {
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    invoice: PropTypes.object,
    selectedAccordion: PropTypes.string,
    fetchInvoiceByCart: PropTypes.func,
    tab: PropTypes.string,
    setTab: PropTypes.func,
    closeTab: PropTypes.func,
    fetchPaymentStatus: PropTypes.func
  }

  componentWillMount() {
    const { fetchPaymentStatus, invoice } = this.props;

    if (invoice.id && !invoice.pay) {
      fetchPaymentStatus(invoice.id);
    }
  }

  componentWillReceiveProps = ({ cart, fetchInvoiceByCart, invoice, closeTab, tab, setTab }) => {
    if (invoice && tab !== 'invoice') setTab();
    else if (invoice.display === false) closeTab();
  }

  render() {
    const { selectedAccordion, user, cart } = this.props;
    const isLeader = user.id === cart.leader.id || user.id === cart.leader;
    return (
      <div className='invoice'>
        { selectedAccordion.includes('form') ? <Forms {...this.props}/> : null}

        <InvoiceInfo {...this.props} />
        { isLeader ? <InvoicePaymentStatus {...this.props}/> : null }
        <InvoiceAddress {...this.props} isLeader={isLeader}/>
        <Shipping {...this.props} isLeader={isLeader}/>
        <Payment {...this.props} isLeader={isLeader}/>
      </div>
    );
  }
}

class InvoicePaymentStatus extends Component {
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    invoice: PropTypes.object,
    actionInvoice: PropTypes.func
  }

  render() {
    const { invoice, actionInvoice } = this.props;
    return (
      <div>
      {
        invoice.usersPayments ? invoice.usersPayments.map((payment, i) => (
                <div key={i} className='text'>
                    <h4>user: {payment.name}</h4>
                    <p>how much: ${payment.amount / 100} </p>
                    <p>status: { payment.paid ? 'user has paid' : <button className='email__user' onClick={()=> actionInvoice(invoice.id, 'email', payment)}>email user to pay</button>  } </p>
                </div>
           )) : null
      }
    </div>
    );
  }
}
