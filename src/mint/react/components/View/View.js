// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Details from './Details';
import { ResultsContainer, ButtonsContainer, CartContainer, InvoiceContainer } from '../../containers';

export default class App extends Component {
  static propTypes = {
    tab: PropTypes.string,
    cart: PropTypes.object,
    user: PropTypes.object,
    likeCart: PropTypes.func,
    unlikeCart: PropTypes.func,
    cloneCart: PropTypes.func,
    oldCart: PropTypes.object
  }

  render() {
    const { tab } = this.props,
      props = this.props,
      containers = {
        'search': ResultsContainer,
        'cart': CartContainer,
        'invoice': InvoiceContainer
      },
      Component = containers[tab];

    return (
      <div className='view'>
        { tab === 'cart' ? <Details {...props} /> : null }
        { Component ? <Component /> : null }
        { tab === 'cart' ? <ButtonsContainer /> : null }
      </div>
    );
  }
}
