// mint/react/components/Results/Selected.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { displayCost, removeDangerousCharactersFromString } from '../../../utils';
import { Right } from '../../../../react-common/kipsvg';

export default class Selected extends Component {

  render() {
    const { cart, item, cartAsins, selectItem, addItem, arrow } = this.props,
          afterClass = !arrow ? 'left' : ( arrow === 1 ? 'middle' : 'right' );

    return (
      <td key={item.id} colSpan='100%' onClick={() => selectItem(item.id)} className='selected'>
        <div className={`card ${cartAsins.includes(item.asin) ? 'incart' : ''} ${afterClass}`}>
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
            <div className='text__expanded'>
              <div dangerouslySetInnerHTML={{__html: removeDangerousCharactersFromString(item.description)}} />
            </div>
          </div> 

          { 
            item.iframe_review_url ? <div className='iframe'>
              <iframe scrolling="no" src={`${item.iframe_review_url}`}/>
            </div> : <div className='padding'/>
          }
          <div className='action'>
            <button onClick={() => addItem(cart.id, item.id)}><span>Add to Cart <Right/></span></button>
          </div>
        </div>
      </td>
    );
  }
}
