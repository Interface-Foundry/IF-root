/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import Typist from 'react-typist';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { Icon } from '../../themes';
import { Services } from '..';

export default class Statement extends Component {


  	render() {
  		const { _toggleModal } = this.props;
	    return (
	      	<div className="statement">
	      		<div className="col-12 row-1 action">
	        		<button>
	        			<a href='/newcart'>TRY KIP FOR FREE</a>
	        		</button>
	        		<button onClick={() => _toggleModal()}>
	        			LOGIN
	        		</button>
	        	</div>
	        	<div className="col-12 row-1 headline">
	        		<h1>COLLABORATE AND COORDINATE SHOPPING</h1>
	        	</div>
	        	<div className="col-12 row-1 text">
	        		<p>
	        			Whether you're a project manager, grassroots organizer, or just a few friends putting together an event, Kip's easy to use design takes the stress out of group orders.
	        		</p>
	        	</div>
	      	</div>
	    );
  	}
}
