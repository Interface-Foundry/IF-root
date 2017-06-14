// mint/react/components/empty/empty.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';


async function getInvoiceByCart (cartId) {
  const invoice = await fetch(`api/invoice/cart/${this.props.cart.id}`)
  return invoice
}

export default class Invoice extends Component {
  state = {loading: true}
  data = {}

  async componentDidMount () {
    const res = await fetch(`http://localhost:3000/api/invoice/cart/${this.props.cart.id}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
     })
    debugger;
    // for koh, doesnt work
    // const data = await res.json()
    // this.data = data

    this.state.loading = false
  }

  render() {
    const { cart } = this.props;

    if (this.state.loading) {
      return (<p> getting invoice </p>)
    }

    return (
      <p> hey {this.data.invoice_type} </p>
    );
  }
}


