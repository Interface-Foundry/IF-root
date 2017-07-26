// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from '../../../../react-common/components';
import { calculateItemTotal, displayCost, timeFromDate, numberOfItems, getStoreName, splitOptionsByType } from '../../../utils';

import CartButtons from './CartButtons';
import CartOptions from './CartOptions';

export default class UserCart extends Component {

  state = {
    open: false
  }

  render() {
    const { userCart, achievements, color, isLeader, openCarts, index, cart, editId, user, updateItem, imageSrc, memberNumber } = this.props,
          { open } = this.state;

    return (
      <td key={userCart.id} colSpan='100%' className={`${achievements[userCart.memberNumber] ? 'gradient' : ''} ${color}`}>
        <div className={`card`}>
          <nav onClick={() => this.setState({open: !open})}>
            <div className='image' style={{backgroundImage: `url(${imageSrc})`}}>
              { memberNumber === 'icon' ? <Icon icon='Check'/> : memberNumber }
            </div>
            <div className='text'>
              { isLeader && userCart.id !== user.id ? <h1><a href={`mailto:${userCart.email_address}?subject=KipCart&body=`}>{userCart.name} <Icon icon='Email'/></a></h1> : <h1>{userCart.name}</h1> }
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
                userCart.items.map((item) => {
                  const itemOptions = splitOptionsByType(item.options)

                  return <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                    <div className={'image'} style={{
                      backgroundImage: `url(${item.main_image_url})`
                    }}/>
                    <div className='text'>
                      <span><a href={item.original_link} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
                      <h1>{item.name}</h1>
                      <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
                      {
                        user.id && (user.id === item.added_by || isLeader) ? <div className='update'>
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
                          { userCart.id === user.id || cart.leader.id === user.id ? <CartOptions {...this.props} item={item} itemOptions={itemOptions}/> : null }
                        </div>
                      ) : null
                    }
                    <CartButtons {...this.props} item={item}/>
                  </li>
                })
              }
            </ul> : null
          }
        </div>
      </td>
    )
  }
}
