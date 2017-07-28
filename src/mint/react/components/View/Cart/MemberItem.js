import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { displayCost, getStoreName } from '../../../utils';
import CartButtons from './CartButtons';

export default class MemberItem extends Component {
  static propTypes = {
    item: PropTypes.object,
    editId: PropTypes.string,
    cart: PropTypes.object,
    user: PropTypes.object,
    isLeader: PropTypes.bool,
    updateItem: PropTypes.func
  }
  render() {
    const { item, editId, cart, updateItem, user, isLeader } = this.props;
    return (
      <li key={item.id} className={editId === item.id ? 'edit' : ''}>
      <div className={'image'} style={{ backgroundImage: `url(${item.main_image_url})` }}/>
      <div className='text'>
        <span>
          <a href={`/api/item/${item.id}/clickthrough`} target="_blank">
            View on {getStoreName(cart.store, cart.price_locale)}
          </a>
        </span>
        <h1>{item.name}</h1>
        <h4> Price: <span className='price'>{displayCost(item.price, cart.price_locale)}</span> </h4>
        {
          !cart.locked && user.id && (user.id === item.added_by || isLeader)
          ? <div className='update'>
              <button
                disabled={item.quantity <= 1}
                onClick={() => updateItem(item.id, { quantity: item.quantity - 1 })}>
                 -
              </button>
              <p>{ item.quantity }</p>
              <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}> + </button>
            </div>
          : null
        }
      </div>
      {
        editId === item.id
        ? (
          <div className='extra'>
            <div className='text__expanded'>
              <span><a href={`/api/item/${item.id}/clickthrough`} target="_blank">View on {getStoreName(cart.store, cart.price_locale)}</a></span>
              <div>
                {item.description}
              </div>
            </div>
          </div>
        )
        : null
      }
      <CartButtons {...this.props} item={item}/>
    </li>
    );
  }
}