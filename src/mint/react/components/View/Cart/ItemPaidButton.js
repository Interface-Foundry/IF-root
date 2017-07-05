// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ItemPaidButton extends Component {

  static propTypes = {
    user: PropTypes.object,
    selectTab: PropTypes.func,
    selectAccordion: PropTypes.func
  }
  componentWillMount() {
    const { invoice, fetchPaymentStatus } = this.props;
    if (invoice) {
      fetchPaymentStatus(invoice.id);
    }
  }
        // { testI.items.includes(item.id) && testI.paid === false ? <button onClick={()=> {testI.paid = true;}}>Pay For this</button> : <p> already paid </p>}

  render() {
    const { selectTab, selectAccordion } = this.props;
    return (
      <div>
        <h3>NOT PAID</h3>
        <button onClick={()=> {selectTab('invoice'); selectAccordion('payments');}}> click here to pay </button>
      </div>
    );
  }
}
