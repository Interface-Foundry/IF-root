import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { getMemberById } from '../../reducers';
import { getNameFromEmail } from '../../utils';

export default class CartItem extends Component {
  static propTypes = {
    added_by: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    locked: PropTypes.bool.isRequired,
    main_image_url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    store: PropTypes.string.isRequired,
    thumbnail_url: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    leader: PropTypes.object.isRequired,
    members: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    push: PropTypes.func.isRequired,
    itemNumber: PropTypes.number.isRequired,
    cart_id: PropTypes.string.isRequired,
    removeItem: PropTypes.func.isRequired,
    incrementItem: PropTypes.func.isRequired,
    decrementItem: PropTypes.func.isRequired,
    isOwner: PropTypes.bool.isRequired
  }

  render() {
    const { added_by, description, itemNumber, main_image_url, name, price, quantity, leader, members, removeItem, incrementItem, decrementItem, id, cart_id, isOwner } = this.props,
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
          <p>Item #{itemNumber} {name}</p>
          <br/>
          <p>Qty: {quantity}</p>
          <p>Price: ${price}</p>
        </div>
        {
          isOwner?
          <div className='cartItem__actions col-12'>
            <button onClick={()=>incrementItem(id, quantity)}>+</button>
            <button onClick={()=> (quantity > 1) ? decrementItem(id, quantity) : removeItem(cart_id, id)}>-</button>
            <button onClick={() => {}}>Edit</button>
          </div>:
          null
        }
        
      </li>
    );
  }
}