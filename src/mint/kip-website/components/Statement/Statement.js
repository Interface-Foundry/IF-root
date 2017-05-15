/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import Typist from 'react-typist';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { Icon } from '../../themes';
import { Services } from '..';

export default class Statement extends Component {


  	render() {
  		const { _toggleModal, src } = this.props;
	    return (
	      	<div className="statement">
	      		{
		      		src !== 'slack' ? <div className="col-12 row-1 action">
		      			<a href='/newcart'>
		        			<button>
			        			Create New Cart <Icon icon='Right'/>
			        		</button>
		        		</a>
		        	</div> : <div className="col-12 row-1 action">
	                  	<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>
	                    	Add To Slack
	                  	</button></a>
	              	</div>
		      	}

	        	<div className="col-12 row-1 headline">
	        		<h1>FREE COLLABORATIVE GROUP SHOPPING</h1>
	        	</div>
	        	<div className="col-12 row-1 text">
	        		<p>
	        			Save money and track spending with Kip. See how much you’re spending in every order, save on shipping and account fees with shared shopping carts.
	        		</p>
	        	</div>

				<h1 className="col-12 row-1 icons__hell__header">As seen in</h1>
				<div className="col-12 row-1 icons__hell">
					<div><Icon icon='Fastcompany'/></div>
					<div><Icon icon='Time'/></div>
	        		<div><Icon icon='Venturebeat'/></div>
	        		<div><Icon icon='Paymentsource'/></div>
	        		<div><Icon icon='Wallstreet'/></div>
	        	</div>
	      	</div>
	    );
  	}
}
