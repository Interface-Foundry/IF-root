// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { calculateItemTotal, displayCost, timeFromDate } from '../../../utils';
import { ButtonsContainer } from '../../../newContainers';

//Analytics!
import ReactGA from 'react-ga';

export default class Details extends Component {

  render() {
    const { name, leader, store,  store_locale, members, items, thumbnail_url, updatedAt, createdAt,  views, tab, selectTab } = this.props,
          total = calculateItemTotal(items);
    return (
      <table className='details'>
        <tbody>
          <tr>
  			    <th colSpan='100%'>
              <div className='card'>
                <div className='left'>
                  <div className={`image`} style={{
                    backgroundImage: `url(${thumbnail_url || '//storage.googleapis.com/kip-random/kip_head_whitebg.png'})`
                  }}/>
                  <div className='text'> 
                    <h1>{name}</h1>
                    <h4>{store} {store_locale}</h4>
                    <p>Created {timeFromDate(createdAt)} by {leader.name}</p>
                  </div> 
                </div>
                <div className='right'>
                  <ButtonsContainer/>
                </div>
              </div>
            </th>
          </tr>
          <tr>
            <td>
              <nav>
                <p> {items.length} items in cart <span className='updated'>❄ Updated {timeFromDate(updatedAt)}</span>  </p>
              </nav>
            </td>
        	</tr>
        </tbody>
      </table>
    );
  }
}



