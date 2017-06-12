// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import Details from './Details'
import { ResultsContainer, SearchContainer, ButtonsContainer, CartContainer } from '../../newContainers';

const containers = {
  'results': ResultsContainer,
  'cart': CartContainer
}

export default class App extends Component {
  render() {
    const { tab, cart, selectTab } = this.props,
          containers = {
            'results': ResultsContainer,
            'cart': CartContainer
          },
          Component = containers[tab];

    return (
      <div className='view'>
        <SearchContainer />
        <Details {...cart} tab={tab} selectTab={selectTab}/>
        { Component ? <Component /> : null }
        <ButtonsContainer />
      </div>
    );
  }
}
