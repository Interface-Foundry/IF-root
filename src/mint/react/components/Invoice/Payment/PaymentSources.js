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

  render() {

    const {
      props: { invoice, createPayment, paymentSources, deletePaymentSource },
      state: { selectedCardIndex }
    } = this;

    return (
      <div>
        {
          paymentSources.map((payment, i) => (
            <li key={i} className={selectedCardIndex === i ? 'selected' : ''} onClick={() => this.setState({selectedCardIndex: i})}>
              <div className='circle'/>
              <div className='text'>
                  <h4>{payment.brand} <span>ending in {payment.last4}</span></h4>
                  <p>Exp: {moment().month(payment.exp_month).year(payment.exp_year).format('MM/YYYY')}</p>
                  <button onClick={()=> deletePaymentSource(payment.id)}>~Delete This~</button>
              </div>
            </li>
          ))
        }
        <button onClick={()=> createPayment(paymentSources[selectedCardIndex].id, invoice.id)}> pay </button>
      </div>
    );
  }
}
