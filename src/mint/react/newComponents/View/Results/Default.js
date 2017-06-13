// mint/react/components/Results/Default.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { displayCost } from '../../../utils';
import { Right } from '../../../../react-common/kipsvg';

export default class Default extends Component {
  render() {
    const { cart, item, cartAsins, selectItem, addItem } = this.props;

    return (
        <td>
          <div className={`card ${cartAsins.includes(item.asin) ? 'incart' : ''}`}>
            {
              cartAsins.includes(item.asin) ? <span className='incart'> In Cart </span> : null
            }
            <div className={`image`} style={{
              backgroundImage: `url(${item.main_image_url})`,
            }}/>
            <div className='text'> 
              <h1>{item.name}</h1>
              <p> Store: {item.store} | {cart.store_locale} </p>
              <h4> Price: <span className='price'>{displayCost(item.price)}</span> </h4>
            </div> 
            <div className='action'>
              <button className='more' onClick={() => selectItem(item.id)}>See More</button>
              <button onClick={() => addItem(cart.id, item.id)}>Add to Cart <Right/></button>
            </div>
          </div>
        </td>
    );
  }
}
