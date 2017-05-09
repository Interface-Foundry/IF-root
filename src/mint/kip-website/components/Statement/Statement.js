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
			        			Try Kip For Free <Icon icon='Right'/>
			        		</button>
		        		</a>
		        	</div> : <div className="col-12 row-1 action">
	                  	<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>
	                    	Add To Slack
	                  	</button></a>
	              	</div>
		      	}

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
