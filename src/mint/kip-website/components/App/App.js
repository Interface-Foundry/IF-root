/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */

import React, { Component } from 'react';
import { Landing, Legal } from '..';

import { Route } from 'react-router-dom';

export default class App extends Component {
	render() {
		const { match } = this.props;
	  	return (
	      <div className='app'>
	      	<Route path={`${match.url}`} exact component={Landing}/>
	      	<Route path={`${match.url}legal`} exact component={Legal}/>
	      	<Route path={`${match.url}s/:src`} exact component={Landing}/>
	      	<Route path={`${match.url}blog`} exact component={Legal}/>
	      </div>
	    );
	}
}

