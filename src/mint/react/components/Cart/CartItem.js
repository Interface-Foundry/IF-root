import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { getMemberById } from '../../reducers';
import { getNameFromEmail } from '../../utils';

export default class CartItem extends Component {
  static propTypes = {
    leader: PropTypes.object,
    history: PropTypes.object,
    item: PropTypes.object,
    members: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    itemNumber: PropTypes.number.isRequired,
    cart_id: PropTypes.string.isRequired,
    removeItem: PropTypes.func.isRequired,
    incrementItem: PropTypes.func.isRequired,
    decrementItem: PropTypes.func.isRequired,
    isOwner: PropTypes.bool.isRequired
  }

  render() {
    const { itemNumber, leader, incrementItem, removeItem, decrementItem, isOwner, cart_id, members, history: { push }, item: { added_by, main_image_url, name, price, quantity, id } } = this.props,
      linkedMember = getMemberById({ members: members, leader: leader }, { id: added_by }),
      memberName = _.capitalize(getNameFromEmail(linkedMember ? linkedMember.email_address : null));
    return (
      <li className='cartItem'>
        <h4 className='cartItem__title'>{memberName}</h4>

        <div className='cartItem__image image col-3 ' style={
          {
            backgroundImage: `url(${main_image_url})`,
            backgroundPosition: 'top',
            height: 75,
          }}/>
        <div className='cartItem__props col-9'>
          <p>{name}</p>
          <br/>
          <p>Qty: {quantity}</p>
          <p>Price: ${price}</p>
        </div>
        {
          isOwner
          ? <div className='cartItem__actions col-12'>
              <button onClick={()=>incrementItem(id, quantity)}>+</button>
              <button onClick={()=> (quantity > 1) ? decrementItem(id, quantity) : removeItem(cart_id, id)}>-</button>
              <button onClick={() => push(`/cart/${cart_id}/m/item/${itemNumber}/${id}/edit`)}>Edit</button>
            </div>
          : null
        }
        
      </li>
    );
  }
}
