// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PaymentSources from './PaymentSources';
import Stripe from './Stripe';
import Paypal from './Paypal';
import RefundPayment from './RefundPayment';

const paymentTypes = [{
    type: 'split_single',
    text: 'Cart Creator Pays' //lets get names in here later
  }, {
    type: 'split_equal',
    text: 'Everyone Pays Equally'
  }, {
    type: 'split_by_item',
    text: 'Everyone Pays for Their Own Items'
  }];

export default class Payment extends Component {
  static propTypes = {
    createPayment: PropTypes.func,
    updateInvoice: PropTypes.func,
    selectAccordion: PropTypes.func,
    fetchPaymentStatus: PropTypes.func,
    selectedAccordion: PropTypes.string,
    invoice: PropTypes.object,
    userPaymentStatus: PropTypes.object,
    isLeader: PropTypes.bool
  }

  componentWillReceiveProps({ fetchPaymentStatus, invoice, userPaymentStatus }) {
    if (invoice !== this.props.invoice && !userPaymentStatus.amount) fetchPaymentStatus(invoice.id);
  }


  render = () => {
    const { userPaymentStatus, selectAccordion, selectedAccordion, invoice, isLeader } = this.props;
    return (
      <div className='payment accordion'>
        <nav className='clickable' onClick={() => selectAccordion('payment')}>
          <h3>2. Payment method</h3>
        </nav>
        {
          selectedAccordion.includes('payment')
            ? <div>
              {
                isLeader ? <PaymentTypeSelection {...this.props}/>
                : <div className='payment-option'>
                  <nav><h4>Payment Type</h4></nav>
                  <ul>
                    <li>
                      <div className='text'>
                        <h4>{paymentTypes.find(p=>p.type===invoice.split_type).text}</h4>
                        <h4> Your payment will be: ${ userPaymentStatus.amount/100 }</h4>
                      </div>
                    </li>
                  </ul>
                </div>
              }
              <nav>
                <h4>Your credit and debit cards</h4>

                </nav>

                <ul>
                  {
                    userPaymentStatus.paid ? <RefundPayment {...this.props}/> :
                      <div>
                        <PaymentSources {...this.props}/>
                        <span className='payment-methods'>
                          <Stripe {...this.props} />
                          <Paypal {...this.props} />
                        </span>
                      </div>
                  }
                </ul>
            </div>
            : null
          }

      </div>
    );
  }
}




class PaymentTypeSelection extends Component {

  _handleUpdateInvoice(paymentType) {
    const { updateInvoice, invoice } = this.props;
    updateInvoice(invoice.id, 'split_type', paymentType);
  }

  componentWillReceiveProps({ fetchPaymentStatus, invoice, userPaymentStatus }) {
    if (invoice !== this.props.invoice && !userPaymentStatus.amount) fetchPaymentStatus(invoice.id);
  }

  render () {

    const { userPaymentStatus, selectAccordion, selectedAccordion, invoice, isLeader } = this.props;

    return (
      <div>
        <nav><h4>Payment Type</h4></nav>
        <ul>
          { !userPaymentStatus.paid ?
            paymentTypes.map(paymentType => (
              <li
              key={paymentType.type}
              className={`clickable ${invoice.split_type === paymentType.type? 'selected' : ''}`}
              onClick={() => this._handleUpdateInvoice(paymentType.type)}>
                <div className='circle'/>
                <div className='text'>
                  <h4>{paymentType.text}</h4>
                </div>
              </li>
            ))
          : null }
        </ul>
      </div>
   )
  }
}