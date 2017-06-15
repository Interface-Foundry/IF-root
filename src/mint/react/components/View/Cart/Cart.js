// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { calculateItemTotal, displayCost, timeFromDate, numberOfItems } from '../../../utils';
import { splitCartById } from '../../../reducers';

import { Icon } from '../../../../react-common/components';
import { EmptyContainer } from '../../../containers';
import CartButtons from './CartButtons';

export default class Cart extends Component {
  
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    editId: PropTypes.string,
    removeItem: PropTypes.func,
    editItem: PropTypes.func,
    copyItem: PropTypes.func
  }

  render() {
    const { cart, user, editId } = this.props,
      userCarts = splitCartById(this.props, user),
      myCart = userCarts.my,
      isLeader = user.id === cart.leader.id;

    return (
      <table className='cart'>
        <thead>
          <tr>
            <th colSpan='100%'>
              {
                myCart.length > 0 ? <div className='card'>
                  { isLeader ? <h1><a href={`mailto:${user.email_address}?subject=KipCart&body=`}>{user.name} <Icon icon='Email'/></a></h1> : <h1>{user.name}</h1> }
                  <h1 className='date'> <span>  </span> </h1>
                  <h4>
                    <span className='price'>{displayCost(calculateItemTotal(myCart), cart.store_locale)}</span> &nbsp;
                    <span className='grey'>({numberOfItems(myCart)} items) ❄ Updated {timeFromDate(myCart[0].updatedAt)}</span>
                  </h4>
                  <ul>
                    {
                      myCart.map((item) => (
                        <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                          <div className={'image'} style={{
                            backgroundImage: `url(${item.main_image_url})`
                          }}/>
                          <div className='text'> 
                            <h1>{item.name}</h1>
                            <h4> Qty: {item.quantity} </h4>
                            <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
                          </div>
                          <CartButtons {...this.props} item={item}/>
                        </li>
                      ))
                    }
                  </ul>
                </div> : ( cart.locked ? null : <EmptyContainer /> )
              }
            </th>
          </tr>
        </thead>
        <tbody>
          {
            userCarts.others.map((userCart, i) => (
              <tr key={userCart.id}>
                <td colSpan='100%'>
                  <div className='card'>
                    { isLeader ? <h1><a href={`mailto:${userCart.email_address}?subject=KipCart&body=`}>{userCart.name} <Icon icon='Email'/></a></h1> : <h1>{userCart.name}</h1> }
                    <h1 className='date'> <span> </span> </h1>
                    <h4>
                      <span className='price'>{displayCost(calculateItemTotal(userCart.items), cart.store_locale)}</span> &nbsp;
                      <span className='grey'>({numberOfItems(userCart.items)} items) ❄ Updated {timeFromDate(myCart[0].updatedAt)}</span>
                    </h4>
                    <ul>
                      {
                        userCart.items.map((item) => (
                          <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                            <div className={'image'} style={{
                              backgroundImage: `url(${item.main_image_url})`
                            }}/>
                            <div className='text'> 
                              <h1>{item.name}</h1>
                              <h4> Qty: {item.quantity} </h4>
                              <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
                            </div> 
                            <CartButtons {...this.props} item={item}/>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }
}
