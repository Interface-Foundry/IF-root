// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ItemPaidButton extends Component {

  static propTypes = {
    user: PropTypes.object,
    selectTab: PropTypes.func,
    selectAccordion: PropTypes.func

  }
  render() {
    const { selectTab, selectAccordion } = this.props;
    return (
      <div>
        <button onClick={()=> {selectTab('invoice'); selectAccordion('payments');}}> click here to pay </button>
      </div>
    );
  }
}
