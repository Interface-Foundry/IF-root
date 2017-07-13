// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { calculateItemTotal, displayCost, timeFromDate, numberOfItems, getStoreName } from '../../../utils';
import { splitCartById } from '../../../reducers';

import { Icon } from '../../../../react-common/components';
import { EmptyContainer } from '../../../containers';
import CartButtons from './CartButtons';
import ItemPaidButton from './ItemPaidButton';

export default class Cart extends Component {
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    editId: PropTypes.string,
    removeItem: PropTypes.func,
    updateItem: PropTypes.func,
    invoice: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);
    this._toggleCart = ::this._toggleCart;
  }

  state = {
    openCarts: []
  }

  _toggleCart(id) {
    const { openCarts } = this.state;

    if(openCarts.includes(id)) {
      const index = openCarts.indexOf(id);
      this.setState({openCarts: [...openCarts.slice(0, index), ...openCarts.slice(index + 1)]});
    } else {
      this.setState({openCarts: [...openCarts, id]});
    }
  }

  render() {
    const { cart, user, editId, invoice, updateItem } = this.props,
      { openCarts } = this.state,
      { _toggleCart } = this,
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

                ? <div className={`card`} onClick={() => openCarts.includes(user.id) ? _toggleCart(user.id) : null}>
                  { isLeader ? <h1><a href={`mailto:${user.email_address}?subject=KipCart&body=`}>{user.name} <Icon icon='Email'/></a></h1> : <h1>{user.name}</h1> }
                  { invoice ? <ItemPaidButton {...this.props}/> : null}
                  <h1 className='date' onClick={() => _toggleCart(user.id)}> 
                    <Icon icon={openCarts.includes(user.id) ? 'Up' : 'Down'}/>
                  </h1>
                  <h4>
                    <span className='grey'>{numberOfItems(myCart)} items • Updated {timeFromDate(myCart[0].updatedAt)}</span>
                  </h4>
                  <h4>
                  <z>
                    Total: <span className='price'>{displayCost(calculateItemTotal(myCart), cart.store_locale)}</span> &nbsp;
                  </z>
                  </h4>
                  { !openCarts.includes(user.id) ? <ul>
                    {
                      myCart.map((item) => {
                        return <li key={item.id} className={editId === item.id ? 'edit' : ''}>
                          <div className={'image'} style={{
                            backgroundImage: `url(${item.main_image_url})`
                          }}/>
                          <div className='text'>
                            <span><a href={`/api/item/${item.id}/clickthrough`} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
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
                                  <span><a href={`/api/item/${item.id}/clickthrough`} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
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
        </thead>
        <tbody>
          {
            userCarts.others.map((userCart, i) => (
              <tr key={userCart.id}>
                <td colSpan='100%'>
                  <div className={`card`} onClick={() => openCarts.includes(userCart.id) ? _toggleCart(userCart.id) : null}>
                    { isLeader ? <h1><a href={`mailto:${userCart.email_address}?subject=KipCart&body=`}>{userCart.name} <Icon icon='Email'/></a></h1> : <h1>{userCart.name}</h1> }
                    <h1 className='date' onClick={() => _toggleCart(userCart.id)}> 
                      <Icon icon={openCarts.includes(userCart.id) ? 'Up' : 'Down'}/>
                    </h1>
                    <h4>
                      <span className='price'>{displayCost(calculateItemTotal(userCart.items), cart.store_locale)}</span> &nbsp;
                      <span className='grey'>({numberOfItems(userCart.items)} items) • Updated {timeFromDate(userCart.updatedAt)}</span>
                    </h4>

                    { 
                      !openCarts.includes(userCart.id) ? <ul>
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
