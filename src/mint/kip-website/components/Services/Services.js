/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';
import { Right, Cloud, Person, Items, Mapper, Down } from '../../themes/newSvg';
import {
  Facebook,
  Outlook,
  Chrome,
  SlackIcon,
  Gmail,
  Apple,
  GooglePlay
} from '../../themes';

export default class Services extends Component {

  	render() {
	    return (
	      	<div className="services col-12"> 
				<div className="col-12">
					<h1 className='tagline'><span>THE KIP SOLUTION</span></h1>
					<h4>
						<span>Kip</span> beats traditional web shopping by bringing all types of products into one place.
					</h4>
					<section className='cluster'>
			        	<Items/>
			        	<div className='inline'>
			        		<Down/>
			        		<Down/>
			        		<Down/>
			        	</div>
			        </section>
			        <div className="col-4 row-1 services__details">
				        <Mapper/>
			        	<h4>
			        		Never create another account. Buy from anywhere with a single click.
			        	</h4>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Use Kip Now <Right/></span></button></a>
			        	</div>
			        </div>

			       	<div className="col-4 row-1 services__details">
				       	<Cloud/>
			        	<h4> 
			        		Share accounts like Amazon Prime without giving away passwords or personal data.
			        	</h4>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Use Kip Now <Right/></span></button></a>
			        	</div>
			        </div>

			       	<div className="col-4 row-1 services__details">
				       	<Person/>
			        	<h4> 
			        		Track orders and expenses through Slack, Email, and Facebook Messenger. 
			        	</h4>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Use Kip Now <Right/></span></button></a>
			        	</div>
			        </div>
		        </div>
	      	</div>
	    );
  	}
}








