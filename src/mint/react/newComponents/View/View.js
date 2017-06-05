// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import Details from './Details'
import { ResultsContainer, SearchContainer, ButtonsContainer, CartContainer } from '../../newContainers';

//Analytics!
import ReactGA from 'react-ga';

export default class App extends Component {

  _logPageView(path, userId) {
    ReactGA.set({ userId });
    ReactGA.event({
      category: 'User',
      action: 'Initial Load'
    });
  }

  render() {
    const { search, cart } = this.props;
    return (
      <div className='view'>
        <SearchContainer />
        <Details {...cart}/>
        { search ? <ResultsContainer/> : <CartContainer/> }
        <ButtonsContainer/>
      </div>
    );
  }
}
