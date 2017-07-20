// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class RewardCard extends Component {

  render() {
    const { title, sub, imageSrc, classes, number } = this.props;

    return (
      <th colSpan='100%' className={classes}>
        <div className={`card reward ${classes}`}>
          <div className='image' style={{backgroundImage: `url(${imageSrc})`}}>
            { number }
          </div>
          <div className='text'>
            <h1>{title}</h1>
            <p>{sub}</p>
          </div>
        </div>
      </th>
    )
  }
}
