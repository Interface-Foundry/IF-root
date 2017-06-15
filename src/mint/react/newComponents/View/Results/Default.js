// mint/react/components/View/Results/Default.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { displayCost } from '../../../utils';
import { Right } from '../../../../react-common/kipsvg';

import { Icon } from '../../../../react-common/components';

export default class Default extends Component {
  static propTypes = {
    cart: PropTypes.object,
    item: PropTypes.object,
    cartAsins: PropTypes.array,
    selectItem: PropTypes.func,
    addItem: PropTypes.func
  }
  
  render() {
    const { cart, item, cartAsins, selectItem, addItem } = this.props;

    return (
      <td>
        <div className={`card ${cartAsins.includes(item.asin) ? 'incart' : ''}`} onClick={() => selectItem(item.id)}>
          {
            cartAsins.includes(item.asin) ? <span className='incart'> In Cart </span> : null
          }
          <div className={'image'} style={{
            backgroundImage: `url(${item.main_image_url})`
          }}/>
          <div className='text'> 
            <h1>{item.name}</h1>
            <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
          </div> 
          <div className='action'>
            <button className='more' onClick={() => selectItem(item.id)}>See More</button>
            { cart.locked ? <button disabled={true}><Icon icon='Locked'/></button> : <button onClick={() => addItem(cart.id, item.id)}>Add to Cart <Right/></button> }
          </div>
        </div>
      </td>
    );
  }
}
