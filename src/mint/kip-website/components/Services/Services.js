/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';
import { Gift, Home, Stats, Right, Brush, Banner } from '../../themes/newSvg';
import {
  Facebook,
  Outlook,
  Chrome,
  SlackIcon,
  Gmail,
  Apple,
  GooglePlay
} from '../../themes';

const comparisonArray = [
	{
		nameSrc: null,
		order: true,
		budget: true,
		tracking: true,
		vendors: true,
		noSignup: true,
		accessability: [],
		pricing: null
	},
	{
		nameSrc: 'https://storage.googleapis.com/kip-random/website/chart_kip.svg',
		order: true,
		budget: true,
		tracking: true,
		vendors: true,
		noSignup: true,
		accessability: [Facebook, Gmail, SlackIcon, Outlook, Chrome],
		pricing: 'FREE'
	},
	{
		nameSrc: 'https://storage.googleapis.com/kip-random/website/chart_hivy.svg',
		order: true,
		budget: true,
		tracking: false,
		vendors: false,
		noSignup: false,
		accessability: [SlackIcon, Apple],
		pricing: 'Credit Card Required'
	},
	{
		nameSrc: 'https://storage.googleapis.com/kip-random/website/chart_q.svg',
		order: true,
		budget: false,
		tracking: false,
		vendors: true,
		noSignup: false,
		accessability: [GooglePlay, Apple],
		pricing: 'Credit Card Required'
	}
]

export default class About extends Component {

  	render() {
	    return (
	      	<div className="services col-12"> 
				<div className="col-12">
					<h1 className='tagline'><span>MEET OUR SOLUTION</span></h1>
					<h4>
						<span>KIP</span> is an A.I Penguin that helps you save money <br/>
						by splitting costs between you and your friends
					</h4>
			        
			        <div className="col-4 row-1 services__details">
				        <Gift/>
			        	<p>
			        		No downloads or signups, Kip lets you shop from anywhere in the U.S, U.K, and Canada. <br/> 
			        	</p>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Add to Slack <Right/></span></button></a>
			        	</div>
			        </div>

			       	<div className="col-4 row-1 services__details">
				       	<Home/>
			        	<p> 
			        		Kip keeps your cart in the cloud and provides you with a unique short URL to share. <br/> 
			        	</p>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Add to Slack <Right/></span></button></a>
			        	</div>
			        </div>

			       	<div className="col-4 row-1 services__details">
				       	<Stats/>
			        	<p> 
			        		Connect with you friends and never miss out on the things you need. 
			        	</p>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Add to Slack <Right/></span></button></a>
			        	</div>
			        </div>
		        </div>
	      	</div>
	    );
  	}
}


        		// <p>No installs or download</p>
			       //  	<p>Unique short URL to share.</p>
