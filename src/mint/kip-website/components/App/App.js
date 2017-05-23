/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */

import React, { Component } from 'react';
import { Legal } from '..';
import { LandingContainer } from '../../containers'
import { PropTypes } from 'prop-types';

import { Route } from 'react-router-dom';

export default class App extends Component {
  static propTypes = {
    name: PropTypes.string,
    updateCarts: PropTypes.func,
    match: PropTypes.object
  }

  render() {
    const { match } = this.props;
    return (
      <div className='app'>
        <Route path={`${match.url}`} exact component={LandingContainer}/>
        <Route path={`${match.url}legal`} exact component={Legal}/>
        <Route path={`${match.url}s/:src`} exact component={LandingContainer}/>
      </div>
    );
  }
}
