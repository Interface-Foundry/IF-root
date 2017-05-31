// react/components/ModifyFooter/ModifyFooter.js
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

export default class ModifyFooter extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    removeItem: PropTypes.func,
    updateItem: PropTypes.func,
    item_id: PropTypes.string,
    history: PropTypes.object,
    old_item_id: PropTypes.string,
    new_item_id: PropTypes.string
  }

  render() {
    const { cart_id, new_item_id, removeItem, updateItem, old_item_id, history: { replace } } = this.props;
    return (
      <footer className='footer__save'>
        <button className='remove dimmed' onClick={()=> {removeItem(cart_id, old_item_id); replace(`/cart/${cart_id}/`);}}>Remove Item</button>
        <button className='save triple' onClick={() =>{updateItem(cart_id, old_item_id, new_item_id); replace(`/cart/${cart_id}/`);}}>✓ Update</button>
      </footer>
    );
  }
}