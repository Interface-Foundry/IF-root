// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { splitOptionsByType } from '../../../utils';
import { Icon } from '../../../../react-common/components';

export default class CartButtons extends Component {

  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    item: PropTypes.object,
    editId: PropTypes.string,
    removeItem: PropTypes.func,
    addItem: PropTypes.func,
    copyItem: PropTypes.func,
    updateItem: PropTypes.func,
    fetchItem: PropTypes.func,
    selectCartItem: PropTypes.func,
    fetchItem: PropTypes.func
  }

  render() {
    const { cart, user, editId, item, removeItem, copyItem, updateItem, fetchItem, selectCartItem } = this.props,
      isLeader = user.id === cart.leader.id,
      options = splitOptionsByType(item.options);


    return (
      <div className='action'>
        { !cart.locked && user.id && (user.id === item.added_by || isLeader) ? <button onClick={() => removeItem(cart.id, item.id)}>Remove</button> : null }
        { !cart.locked && user.id && (user.id !== item.added_by) ? <button onClick={() => copyItem(cart.id, item.id)}><span>Copy</span></button> : null }
        { !user.id  ? <button onClick={() => fetchItem(item.id)}><span>View</span></button> : null }
        { cart.locked ? <button className="locked" disabled='true'><Icon icon='Locked'/></button> : null }
        { editId !== item.id ? <button className='info' onClick={() => { fetchItem(item.id); selectCartItem(item.id)}}>More Info</button> : <button className='info' onClick={() =>  selectCartItem(null)}>Hide Info</button> }
      </div>
    );
  }
}
