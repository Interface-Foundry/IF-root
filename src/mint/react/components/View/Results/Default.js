// mint/react/components/View/Results/Default.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../../utils';
import { Icon } from '../../../../react-common/components';
import LoadingTile from './LoadingTile';

export default class Default extends Component {
  static propTypes = {
    cart: PropTypes.object,
    item: PropTypes.object,
    cartAsins: PropTypes.array,
    selectItem: PropTypes.func,
    addItem: PropTypes.func,
    togglePopup: PropTypes.func,
    user: PropTypes.object
  }

  render() {
    const { user, cart, item, cartAsins, selectItem, addItem, togglePopup } = this.props;
    if (!item) return <LoadingTile />;
    return (
      <td>
        <div className={`card ${cartAsins.includes(`${item.asin}-${user.id}`) ? 'incart' : ''}`} onClick={() => !cartAsins.includes(`${item.asin}-${user.id}`) ? selectItem(item.id) : null}>
          {
            cartAsins.includes(`${item.asin}-${user.id}`) ? <span className='incart'> In Cart </span> : null
          }
          <div className={'image'} style={{
            backgroundImage: `url(${item.main_image_url})`
          }}/>
          <div className='text'> 
            <h1>{item.name}</h1>
            <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
          </div> 
          <div className='action'>
            { !cartAsins.includes(`${item.asin}-${user.id}`) ? <button className='more' onClick={() => selectItem(item.id)}>More info</button> : null }
            { !user.id  ? <button onClick={() => togglePopup()}>Login to Save to Cart</button> : null }
            { cart.locked && user.id ? <button disabled={true}><Icon icon='Locked'/></button> : null }
            { !cart.locked && user.id && !cartAsins.includes(`${item.asin}-${user.id}`) ? <button onClick={(e) => {e.stopPropagation(); addItem(cart.id, item.id);}}>✔ Save to Cart</button> : null }
            { !cart.locked && user.id && cartAsins.includes(`${item.asin}-${user.id}`) ? <button disabled={true}>In Cart</button> : null }
          </div>
        </div>
      </td>
    );
  }
}
