// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from '../../../../react-common/components';
import { calculateItemTotal, displayCost, timeFromDate, numberOfItems, getStoreName } from '../../../utils';

import CartButtons from './CartButtons';

export default class MyCart extends Component {

  state = {
    open: true
  }

  render() {
    const { myCart, achieveIndex, color, isLeader, openCarts, index, cart, editId, user, updateItem } = this.props,
          { open } = this.state;

    return (
      <tr>
        <th colSpan='100%'>
          {
            myCart.length
            ? <div className={`card`} onClick={() => !open ? this.setState({open: !open}) : null}>
              { isLeader ? <h1><a href={`mailto:${user.email_address}?subject=KipCart&body=`}>{user.name} <Icon icon='Email'/></a></h1> : <h1>{user.name}</h1> }
              <h1 className='date' onClick={() => this.setState({open: !open})}>
                <Icon icon={open ? 'Up' : 'Down'}/>
              </h1>
              <h4>
                <span className='grey'>{numberOfItems(myCart)} items • {timeFromDate(myCart[0].updatedAt)}</span>
              </h4>
              <h4>
              <z>
                Total: <span className='price'>{displayCost(calculateItemTotal(myCart), cart.store_locale)}</span> &nbsp;
              </z>
              </h4>
              { open ? <ul>
                {
                  myCart.map((item) => {
                    return <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                      <div className={'image'} style={{
                        backgroundImage: `url(${item.main_image_url})`
                      }}/>
                      <div className='text'>
                        <span><a href={`${item.original_link}`} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
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
                              <span><a href={`${item.original_link}`} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
                              <div>
                                {item.description}
                              </div>
                            </div>
                          </div>
                        ) : null
                      }
                      <CartButtons {...this.props} item={item}/>
                    </li>;
                  })
                }
              </ul> : null }
            </div> : null
          }
        </th>
      </tr>
    )
  }
}
