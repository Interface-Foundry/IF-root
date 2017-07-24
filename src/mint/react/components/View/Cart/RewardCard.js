// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from '../../../../react-common/components';
import { Link } from 'react-router-dom';

export default class RewardCard extends Component {

  render() {
    const { title, sub, imageSrc, classes, number, share, cart } = this.props;

    return (
      <th colSpan='100%' className={classes}>
        <div className={`card reward ${classes}`}>
          <div className='image' style={{backgroundImage: `url(${imageSrc})`}}>
            { number === 'icon' ? <Icon icon='Check'/> : number }
          </div>
          <div className='text'>
            <h1>{title}</h1>
            <p>{sub}</p>
          </div>
          {
            share ? <button className='share'><Link to={`/cart/${cart.id}/m/share`} >
              <Icon icon='Person'/>
              SHARE
            </Link></button> : null
          }
        </div>
      </th>
    )
  }
}
