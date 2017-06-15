// react/components/Item/DealInfo.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { displayCost } from '../../utils';

export default class DealInfo extends Component {
  static propTypes = {
    item: PropTypes.object,
    deal: PropTypes.object
  }
  render() {
    const { deal: { price, previousPrice, savePercent } } = this.props;
    // make sure item and deal are defined
    const convertedPrice = price ? displayCost(price) : '0.00',
      convertedPrevPrice = previousPrice ? displayCost(previousPrice) : '0.00',
      convertedPercent = savePercent ? (savePercent * 100)
      .toFixed() : '0';
    return (
      <div className = 'deal__view__price' >
        <div>
          <h4>Price: <span>{convertedPrice}</span></h4>
          <h5><strike>{convertedPrevPrice}</strike> ({convertedPercent}% off)</h5>
        </div>
      </div>
    );
  }
}
