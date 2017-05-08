/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */

import React, { Component } from 'react';
import { Landing, Legal } from '..';

import { Route } from 'react-router';

export default class App extends Component {
  	
	render() {
		const { match } = this.props;

	  	return (
	      <div className='app'>
	      	<Route path={`${match.url}`} exact component={Landing}/>
	      	<Route path={`${match.url}:src`} component={Landing}/>
	      	<Route path={`${match.url}legal`} component={Legal}/>
	      </div>
	    );
	}

}

