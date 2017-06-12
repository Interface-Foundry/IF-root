// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import Details from './Details'
import { ResultsContainer, SearchContainer, ButtonsContainer, CartContainer } from '../../newContainers';

export default class App extends Component {
  render() {
    const { tab, cart } = this.props,
          containers = {
            'search': ResultsContainer,
            'cart': CartContainer
          },
          Component = containers[tab];

    return (
      <div className='view'>
        <SearchContainer />
        { tab === 'cart' ? <Details {...cart}/> : null }
        { Component ? <Component /> : null }
        <ButtonsContainer />
      </div>
    );
  }
}
