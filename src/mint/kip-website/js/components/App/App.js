/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */

import React, { Component } from 'react';
import { Landing } from '..';
import { SidenavContainer } from '../../containers';

import { Route } from 'react-router';

export default class App extends Component {
	state = {
		sidenav: false
	}

	_toggleSidenav = () => {
    	const { sidenav } = this.state;
    	this.setState({ sidenav: !sidenav });
  	}
  	
	render() {
		const { props: { match }, state: { sidenav }, _toggleSidenav } = this;
	  	return (
	      <div className='app'>
	      	{ sidenav ? <SidenavContainer _toggleSidenav={_toggleSidenav}/> : null }
	      	<Route path={`${match.url}`} component={() => <Landing _toggleSidenav={_toggleSidenav}/>}/>
	      </div>
	    );
	}

}

