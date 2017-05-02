// react/components/Item/AddRemove.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class AddRemove extends Component {
  static propTypes = {
    item: PropTypes.object,
    incrementItem: PropTypes.func,
    decrementItem: PropTypes.func,
  }
  render() {
    const { item: { id, quantity, added_by }, incrementItem, decrementItem } = this.props;
    return (
      !added_by
        ? null
        : <div className='item__view__quantity'>
            <button onClick={()=>incrementItem(id, quantity)}>+</button>
            <div className='item__view__quantity__num'>{quantity}</div>
            {
              <button disabled={!(quantity > 1)} onClick={()=> decrementItem(id, quantity)}>-</button>
            } 
          </div>
    );
  }
}
