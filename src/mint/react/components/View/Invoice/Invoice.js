// react/components/View/Invoice/Invoice.js

// import PropTypes from 'prop-types';
import React, { Component } from 'react';

// async function getInvoiceByCart(cartId) {
//   const invoice = await fetch(`api/invoice/cart/${this.props.cart.id}`);
//   return invoice;
// }

export default class Invoice extends Component {
  // state = { loading: true }
  // data = {}

  // static propTypes = {
  //   cart: PropTypes.object
  // }

  // async componentDidMount() {
  //   const res = await fetch(`http://localhost:3000/api/invoice/cart/${this.props.cart.id}`, {
  //     method: 'GET',
  //     credentials: 'same-origin',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Accept': 'application/json'
  //     }
  //   });

  //   // for koh, doesnt work
  //   // debugger;
  //   // const data = await res.json()
  //   // this.data = data

  //   this.state.loading = false;
  // }

  render() {
    // if (this.state.loading) {
      return (<p> getting invoice </p>);
    // }

    // return (
    //   <p> hey {this.data.invoice_type} </p>
    // );
  }
}
