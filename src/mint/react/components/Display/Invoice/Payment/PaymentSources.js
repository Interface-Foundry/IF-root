// mint/react/components/View/Invoice/Payment/PaymentSources.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class PaymentSources extends Component {
  static propTypes = {
    invoice: PropTypes.object,
    paymentSources: PropTypes.array,
    fetchPaymentSources: PropTypes.func,
    deletePaymentSource: PropTypes.func,
    createPayment: PropTypes.func
  }

  state = {
    selectedCardIndex: null
  }

  componentWillMount() {
    const { fetchPaymentSources } = this.props;
    fetchPaymentSources();
  }

  // auto select a payment if its the only one
  componentWillReceiveProps = ({ paymentSources }) =>
    (paymentSources.length === 1) ? this.setState({ selectedCardIndex: 0 }) : this.state.selectedCardIndex

  render() {

    const {
      props: { invoice, createPayment, paymentSources, deletePaymentSource },
      state: { selectedCardIndex }
    } = this;

    return (
        <div>
          {
            paymentSources.map((payment, i) => (
              (payment !== null) ?
                <li key={i} className={(selectedCardIndex === i ? 'selected' : '') + ' clickable'} onClick={() => this.setState({selectedCardIndex: i})}>
                <div className='circle'/>
                <div className='text'>
                    <h4>{payment.brand} <span>ending in {payment.last4}</span></h4>
                    <p>Exp: {moment().month(payment.exp_month).year(payment.exp_year).format('MM/YYYY')}</p>
                    <button className='delete__button' onClick={()=> deletePaymentSource(payment.id)}>Remove Card</button>
                </div>
              </li>
            : null ))
          }
          { paymentSources.length ? 'Select a card to pay with' : null}
          {
            (paymentSources.length > 0 && selectedCardIndex !== null)
              ? <button className='pay__button' onClick={()=> createPayment(paymentSources[selectedCardIndex].id, invoice.id)}>Pay With Selected Card</button>
              : null
          }
        </div>
    );
  }
}