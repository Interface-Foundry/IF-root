// mint/react/components/View/Results/Default.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../../utils';
import { Icon } from '../../../../react-common/components';

export default class Default extends Component {
  static propTypes = {
    cart: PropTypes.object,
    item: PropTypes.object,
    inCart: PropTypes.bool,
    selectItem: PropTypes.func,
    addItem: PropTypes.func,
    togglePopup: PropTypes.func,
    user: PropTypes.object,
    fetchSearchItem: PropTypes.func
  }

  render() {
    const { user, cart, item, inCart, selectItem, addItem, togglePopup, fetchSearchItem } = this.props;
    return (
      <td>
        <div className={`card ${inCart ? 'incart' : ''}`} onClick={() => { if (!inCart) { selectItem(item.id); fetchSearchItem(item.id); }}}>
          {
            inCart ? <span className='incart'> In Cart </span> : null
          }
          <div className={'image'} style={{
            backgroundImage: `url(${item.main_image_url})`
          }}/>
          <div className='text'> 
            <h1>{item.name}</h1>
            <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
          </div> 
          <div className='action'>
            { !inCart ? <button className='more' onClick={() => { selectItem(item.id); fetchSearchItem(item.id); }}>More info</button> : null }
            { !user.id  ? <button onClick={() => togglePopup()}>Login to Save to Cart</button> : null }
            { cart.locked && user.id ? <button disabled={true}><Icon icon='Locked'/></button> : null }
            { !cart.locked && user.id && !inCart ? <button onClick={(e) => {e.stopPropagation(); addItem(cart.id, item.id);}}>✔ Save to Cart</button> : null }
            { !cart.locked && user.id && inCart ? <button disabled={true}>In Cart</button> : null }
          </div>
        </div>
      </td>
    );
  }
}
