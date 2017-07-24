// mint/react/components/View/Invoice/Paypal.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PaypalExpressBtn from 'react-paypal-express-checkout';

//
// https://github.com/thinhvo0108/react-paypal-express-checkout
//
// @class      Paypal (name) - paypal react component
//
export default class Paypal extends Component {
  static propTypes = {
    invoice: PropTypes.object,
    user: PropTypes.object,
    cart: PropTypes.object,
    userPaymentStatus: PropTypes.object,
    createPaymentWithoutSource: PropTypes.func
  }


  render() {
    const { invoice, userPaymentStatus, createPaymentWithoutSource } = this.props;
    const invoiceId = invoice.id;
    const amount = userPaymentStatus.amount;

    let client = {
      sandbox: 'AW4Qaa3xF5SKI1Ysz6kTkFWq0c7AGBtpUXlJEkkO8SMhMO5Kn--MiEjVvhG6fwTkj0cuhTbmJMlF7_om',
      live: 'AVr0hZHU5vDLj1MVHlVchyeDCOrcmFPCT2pxv3A0zLjntjmiwT4wP-pH1K92jwlShkZj5IDYX08FYfbX'
    };
    let currency = 'USD';
    let env = 'sandbox';

    // const onSuccessCreatePaymentSource = (payment) => {
    //   createPaymentSource(total, payment, 'paypal', invoiceId);
    // };
    const onSuccess = (payment) => {
      // Congratulation, it came here means everything's fine!
      console.log("The payment was succeeded!", payment);
      createPaymentWithoutSource()
                // You can bind the "payment" object's value to your state or props or whatever here, please see below for sample returned data
    };

    const onCancel = (data) => {
      // User pressed "cancel" or close Paypal's popup!
      console.log('The payment was cancelled!', data);
    };

    const onError = (err) => {
      // The main Paypal's script cannot be loaded or somethings block the loading of that script!
      console.log("Error!", err);
    };

    return (

      <PaypalExpressBtn
        env={env}
        client={client}
        onError={onError}
        shipping={1}
        onSuccess={onSuccess}
        onCancel={onCancel}
        currency={currency}
        total={amount / 100.0}
      />
    );
  }
}
