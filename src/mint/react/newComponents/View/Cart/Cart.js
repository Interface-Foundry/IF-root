// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { calculateItemTotal, displayCost, timeFromDate } from '../../../utils';
import { splitCartById } from '../../../newReducers';
import Empty from '../Empty';

//Analytics!
import ReactGA from 'react-ga';

export default class Cart extends Component {

  render() {

    const { cart, user, query, editId, editItem, removeItem } = this.props,
      userCarts = splitCartById(this.props, user),
      myCart = userCarts.my;

    return (
      <table className='cart'>
        <thead>
          <tr>
            <th colSpan='100%'>
              {
                myCart.length > 0 ? <div className='card'>
                  <h1>{user.name} <span> - {myCart.length} items</span> </h1>
                  <h1 className='date'> <span> {timeFromDate(myCart[0].updatedAt)} </span> </h1>
                  <h4> Total: <span className='price'>{displayCost(calculateItemTotal(myCart))}</span></h4>
                  <ul>
                    {
                      myCart.map((item) => (
                        <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                          <div className={`image`} style={{
                            backgroundImage: `url(${item.main_image_url})`,
                          }}/>
                          <div className='text'> 
                            <h1>{item.name}</h1>
                            <p> Store: {item.store} | {cart.store_locale} </p>
                            <h4> Qty: {item.quantity} </h4>
                            <h4> Price: <span className='price'>{displayCost(item.price)}</span> </h4>
                          </div>
                          {
                            editId !== item.id ? 
                            <div className='action'>
                              <button onClick={() => editItem(item.id)}><span>Edit Item</span></button>
                            </div> :
                            <div className='action'>
                              <button onClick={() => removeItem(cart.id, item.id)}><span>Remove Item</span></button>
                            </div> 
                          }
                        </li>
                      ))
                    }
                  </ul>
                </div> : <Empty/>
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
                    <h1>{userCart.name} <span> - {userCart.items.length} items</span> </h1>
                    <h1 className='date'> <span> {timeFromDate(userCart.items[0].updatedAt)} </span> </h1>
                    <h4> Total: <span className='price'>{displayCost(calculateItemTotal(userCart.items))}</span></h4>
                    <ul>
                      {
                        userCart.items.map((item) => (
                          <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                            <div className={`image`} style={{
                              backgroundImage: `url(${item.main_image_url})`,
                            }}/>
                            <div className='text'> 
                              <h1>{item.name}</h1>
                              <p> Store: {item.store} | {cart.store_locale} </p>
                              <h4> Qty: {item.quantity} </h4>
                              <h4> Price: <span className='price'>{displayCost(item.price)}</span> </h4>
                            </div> 
                            {
                              editId !== item.id ? 
                              <div className='action'>
                                <button onClick={() => editItem(item.id)}><span>Edit Item</span></button>
                              </div> :
                              <div className='action'>
                                <button onClick={() => removeItem(cart.id, item.id)}><span>Remove Item</span></button>
                              </div> 
                            }
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


