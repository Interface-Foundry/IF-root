// mint/react/components/View/Invoice/Paypal.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PaypalExpressBtn from 'react-paypal-express-checkout';


//
// @class      Paypal (name) - paypal react component
//
export default class Paypal extends Component {
  static propTypes = {
    invoice: PropTypes.object,
    user: PropTypes.object,
    cart: PropTypes.object,
    userPaymentStatus: PropTypes.object,
    fetchPaymentStatus: PropTypes.func,
    createPaymentWithoutSource: PropTypes.func
  }

  componentWillMount() {
    const { fetchPaymentStatus, invoice } = this.props;
    fetchPaymentStatus(invoice.id);
  }

  render() {
    const { invoice, userPaymentStatus, createPaymentWithoutSource } = this.props;
    const invoiceId = invoice.id;
    const amount = userPaymentStatus.amount;

    let client = {
      sandbox: 'AW4Qaa3xF5SKI1Ysz6kTkFWq0c7AGBtpUXlJEkkO8SMhMO5Kn--MiEjVvhG6fwTkj0cuhTbmJMlF7_om',
      live: 'AVr0hZHU5vDLj1MVHlVchyeDCOrcmFPCT2pxv3A0zLjntjmiwT4wP-pH1K92jwlShkZj5IDYX08FYfbX'
    };
    let env = 'sandbox';

    const onSuccess = (payment) => {
      createPaymentWithoutSource(amount, payment, 'paypal', invoiceId);
    };

    const onCancel = (data) => {
      // User pressed "cancel" or close Paypal's popup!
      console.log('The payment was cancelled!', data);
    };

    return (

      <PaypalExpressBtn
        env={env}
        client={client}
        shipping={1}
        onSuccess={onSuccess}
        onCancel={onCancel}
        currency={'USD'}
        total={amount / 100}
      />
    );
  }
}
