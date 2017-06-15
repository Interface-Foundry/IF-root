// mint/react/components/View/Results/Selected.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { displayCost, removeDangerousCharactersFromString } from '../../../utils';
import { Delete } from '../../../../react-common/kipsvg';

import { Icon } from '../../../../react-common/components';

export default class Selected extends Component {

  static propTypes = {
    cart: PropTypes.object,
    item: PropTypes.object,
    cartAsins: PropTypes.array,
    selectItem: PropTypes.func,
    addItem: PropTypes.func,
    arrow: PropTypes.number,
    user: PropTypes.object,
    togglePopup: PropTypes.func
  }

  render() {
    const { user, cart, item, cartAsins, selectItem, addItem, arrow, togglePopup } = this.props,
      afterClass = !arrow ? 'left' : (arrow === 1 ? 'middle' : 'right');

    return (
      <td key={item.id} colSpan='100%' className='selected'>
        <div className={`card ${cartAsins.includes(item.asin) ? 'incart' : ''} ${afterClass}`}>
          <button className='close' onClick={() => selectItem(null)}>
            <Delete/>
          </button>
          {
            cartAsins.includes(item.asin) ? <span className='incart'> In Cart </span> : null
          }
          <div className={'image'} style={{
            backgroundImage: `url(${item.main_image_url})`
          }}/>
          <div className='text'> 
            <h1>{item.name}</h1>
            <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
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
            { !user.id  ? <button onClick={() => togglePopup()}>✔ Add to Cart</button> : null }
            { cart.locked && user.id ? <button disabled={true}><Icon icon='Locked'/></button> : null }
            { !cart.locked && user.id ? <button onClick={() => addItem(cart.id, item.id)}><span>✔ Add to Cart</span></button> : null}
          </div>
        </div>
      </td>
    );
  }
}
