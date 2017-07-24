// mint/react/components/View/Results/Trending.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost, getStoreName } from '../../../utils';
import { Icon } from '../../../../react-common/components';

export default class Default extends Component {
  static propTypes = {
    cart: PropTypes.object,
    item: PropTypes.object,
    inCart: PropTypes.bool,
    togglePopup: PropTypes.func,
    user: PropTypes.object,
    fetchSearchItem: PropTypes.func,
    submitQuery: PropTypes.func,
    updateQuery: PropTypes.func
  }

  render() {
    const { user, cart, item, inCart, togglePopup, fetchSearchItem, submitQuery, updateQuery } = this.props;

    return (
      <td>
        <div className={`card ${inCart ? 'incart' : ''}`}>
          {
            inCart ? <span className='incart'> In Cart </span> : null
          }
          <span className='link'><a href={item.original_link} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
          <div className={'image'} style={{
            backgroundImage: `url(${item.main_image_url})`
          }}/>
          <div className='text'> 
            <h1>{item.name}</h1>
            <h4> <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
          </div> 
          <div className='action'>
            { !user.id  ? <button onClick={() => togglePopup()}>Login to Save</button> : null }
            { !cart.locked && user.id && !inCart ? <button className='yellow' onClick={(e) => {e.stopPropagation(); updateQuery(item.original_link); submitQuery(item.original_link, cart.store, cart.store_locale); }}><Icon icon='Check'/> Save to Cart</button> : null }
            { !cart.locked && user.id && inCart ? <button disabled={true}>In Cart</button> : null }
          </div>
        </div>
      </td>
    );
  }
}
