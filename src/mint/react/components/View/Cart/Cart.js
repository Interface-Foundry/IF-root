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
    updateItem: PropTypes.func
  }

  render() {
    const { cart, user, editId, removeItem, updateItem } = this.props,
      userCarts = splitCartById(this.props, user),
      myCart = userCarts.my,
      isLeader = user.id === cart.leader.id;

    return (
      <table className='cart'>
        <thead>
          <tr>
            <th colSpan='100%'>
              {
                myCart.length
                ? <div className='card'>
                  { isLeader ? <h1><a href={`mailto:${user.email_address}?subject=KipCart&body=`}>{user.name} <Icon icon='Email'/></a></h1> : <h1>{user.name}</h1> }
                  <h1 className='date'> <span>  </span> </h1>
                  <h4>
                    <span className='grey'>{numberOfItems(myCart)} items ❄ Updated {timeFromDate(myCart[0].updatedAt)}</span>
                  </h4>
                  <h4>
                    Total: <span className='price'>{displayCost(calculateItemTotal(myCart), cart.store_locale)}</span> &nbsp;
                  </h4>
                  <ul>
                    {
                      myCart.map((item) => {
                        return <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                          <div className={'image'} style={{
                            backgroundImage: `url(${item.main_image_url})`
                          }}/>
                          <div className='text'> 
                            <h1>{item.name}</h1>
                            <h4> Price: <span className='price'>{displayCost(item.price * item.quantity, cart.store_locale)}</span> </h4>
                            { 
                              !cart.locked && user.id && (user.id === item.added_by || isLeader) ? <div className='update'>
                                <button onClick={() => item.quantity === 1 ? removeItem(cart.id, item.id) : updateItem(item.id, { quantity: item.quantity - 1 })}> - </button>
                                <p>{ item.quantity }</p>
                                <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}> + </button>
                              </div> : null 
                            }
                          </div>
                          {
                            editId === item.id ? (
                              <div className='extra'>
                                <div className='text__expanded'>
                                  <span><a href={`/api/item/${item.id}/clickthrough`}>View on Amazon.com</a></span>
                                  <div>
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            ) : null
                          }
                          <CartButtons {...this.props} item={item}/>
                        </li>
                      })
                    }
                  </ul>
                </div> : null
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
                      <span className='grey'>({numberOfItems(userCart.items)} items) ❄ Updated {timeFromDate(userCart.updatedAt)}</span>
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
                              <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
                              { 
                                !cart.locked && user.id && (user.id === item.added_by || isLeader) ? <div className='update'>
                                  <button onClick={() => item.quantity === 1 ? removeItem(cart.id, item.id) : updateItem(item.id, { quantity: item.quantity - 1 })}> - </button>
                                  <p>{ item.quantity }</p>
                                  <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}> + </button>
                                </div> : null 
                              }
                            </div> 
                            {
                              editId === item.id ? (
                                <div className='extra'>
                                  <div className='text__expanded'>
                                    <span><a href={item.original_link}>View on Amazon.com</a></span>
                                    <div>
                                      {item.description}
                                    </div>
                                  </div>
                                </div>
                              ) : null
                            }
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
          <tr>
           { myCart.length ? null : ( cart.locked ? null : <EmptyContainer /> ) }
          </tr>
        </tbody>
      </table>
    );
  }
}
