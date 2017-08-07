// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Payment from './Payment';
import InvoiceAddress from './InvoiceAddress';
import InvoiceInfo from './InvoiceInfo';
import Shipping from './Shipping';
import Forms from './Forms';
import { displayCost } from '../../../utils';

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
    const { selectedAccordion, user, cart, invoice } = this.props;
    const isLeader = user.id === cart.leader.id || user.id === cart.leader;
    const leaderHasPaid = (invoice.usersPayments || []).reduce((paid, payment) => {
      return paid || payment.user_id === user.id && payment.paid;
    }, false)

    const showReminderButtons = isLeader && leaderHasPaid && invoice.split_type !== 'split_single';

    return (
      <div className='invoice'>
        { selectedAccordion.includes('form') ? <Forms {...this.props}/> : null}

        <InvoiceInfo {...this.props} />

        { showReminderButtons ? <InvoicePaymentStatus {...this.props}/> : null }

        <InvoiceAddress {...this.props} isLeader={isLeader} editable={leaderHasPaid} />
        <Shipping {...this.props} isLeader={isLeader} editable={leaderHasPaid} />
        <Payment {...this.props} isLeader={isLeader} editable={leaderHasPaid} />
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
    const { invoice, actionInvoice, user } = this.props;

    // list of user payments that need to be processed
    const payments = invoice.usersPayments && invoice.usersPayments.map((payment, i) => {
      const isThisUser = user.id === payment.user_id

      const name = isThisUser ? 'You' : payment.name
      if (payment.paid) {
        var text = 'paid'
      } else if (isThisUser) {
        text = 'owe'
      } else {
        text = 'owes'
      }

      const action = payment.paid || user.id === payment.user_id ? null : (
        <a className='email__user action' onClick={()=> actionInvoice(invoice.id, 'email', payment)}>Send Reminder Email</a>
      )
      return (
        <div key={i} className='text'>
          <b>{name}</b> {text} <b>{displayCost(payment.amount)} {action}</b>
        </div>
      )
    }).filter(Boolean)

    return (
      <div className="payment accordion">
        {payments}
      </div>
    );
  }
}
