// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from '../../../../react-common/components';
import { calculateItemTotal, displayCost, timeFromDate, numberOfItems, getStoreName } from '../../../utils';

import CartButtons from './CartButtons';

export default class UserCart extends Component {

  state = {
    open: false
  }

  render() {
    const { userCart, achieveIndex, color, isLeader, openCarts, index, cart, editId, user, updateItem, imageSrc } = this.props,
          { open } = this.state;

    return (
      <tr key={userCart.id}>
        <td colSpan='100%' className={`${achieveIndex[userCart.memberNumber] ? 'gradient' : ''} ${color}`}>
          <div className={`card`} onClick={() => !open ? this.setState({open: !open}) : null}>
            <nav>
              <div className='image' style={{backgroundImage: `url(${imageSrc})`}}>
                { userCart.memberNumber }
              </div>
              <div className='text'>
                { isLeader ? <h1><a href={`mailto:${userCart.email_address}?subject=KipCart&body=`}>{userCart.name} <Icon icon='Email'/></a></h1> : <h1>{userCart.name}</h1> }
                <h1 className='date' onClick={() => this.setState({open: !open})}>
                  <Icon icon={open ? 'Up' : 'Down'}/>
                </h1>
                <h4>
                  <span className='price'>{displayCost(calculateItemTotal(userCart.items), cart.store_locale)}</span> &nbsp;
                  <span className='grey'>({numberOfItems(userCart.items)} items) • {timeFromDate(userCart.updatedAt)}</span>
                </h4>
              </div>
            </nav>
            {
              open ? <ul>
                {
                  userCart.items.map((item) => (
                    <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                      <div className={'image'} style={{
                        backgroundImage: `url(${item.main_image_url})`
                      }}/>
                      <div className='text'>
                        <span><a href={item.original_link} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
                        <h1>{item.name}</h1>
                        <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
                        {
                          !cart.locked && user.id && (user.id === item.added_by || isLeader) ? <div className='update'>
                            <button disabled={item.quantity <= 1} onClick={() => updateItem(item.id, { quantity: item.quantity - 1 })}> - </button>
                            <p>{ item.quantity }</p>
                            <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}> + </button>
                          </div> : null
                        }
                      </div>
                      {
                        editId === item.id ? (
                          <div className='extra'>
                            <div className='text__expanded'>
                              <span><a href={item.original_link} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
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
              </ul> : null
            }
          </div>
        </td>
      </tr>
    )
  }
}
