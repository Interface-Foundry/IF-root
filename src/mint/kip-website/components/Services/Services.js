/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

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
	      	<div className="services"> 
				<div className="col-12">
					<h1 className='tagline'>Empowering Consumers through Technology</h1>
			        <div className="col-4 row-1 services__details">
				       	<div className="image" style={{backgroundImage: 'url("https://storage.googleapis.com/kip-random/website/slackClip.png")'}}/ >
			        	<h2>Globaly Available Inventory</h2>
		        		<p>No installs or download</p>
			        	<p>Unique short URL to share</p>
			        	<p>Invite friends with link or email</p>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>Add to Slack</button></a>
			        	</div>
			        </div>

			       	<div className="col-4 row-1 services__details">
				       	<div className="image" style={{backgroundImage: 'url("https://storage.googleapis.com/kip-random/website/slackClip.png")'}}/ >
			        	<h2>Easily Mannage Group Orders</h2>
			        	<p>Great for teams already on Slack</p>
			        	<p>Chat with Kip bot for essentials</p>
			        	<p>Coordinate lunch delivery</p>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>Add to Slack</button></a>
			        	</div>
			        </div>

			       	<div className="col-4 row-1 services__details">
				       	<div className="image" style={{backgroundImage: 'url("https://storage.googleapis.com/kip-random/website/slackClip.png")'}}/ >
			        	<h2>Seamless International Payments</h2>
			        	<p>Great for teams already on Slack</p>
			        	<p>Chat with Kip bot for essentials</p>
			        	<p>Coordinate lunch delivery</p>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>Add to Slack</button></a>
			        	</div>
			        </div>

					<div className="col-12 row-1 services__comparison">
						{
							comparisonArray.map((app, i) => {
								if(!app.nameSrc) return (
									<ul key={i} className="app col-3 row-1">
										<li></li>
										<li><p>Order Management</p></li>
										<li><p>Budget Setting</p></li>
										<li><p>Track Orders</p></li>
										<li><p>Multiple Vendors</p></li>
										<li><p>No Signup/Download</p></li>
										<li className='accessability'><p>Accessibility</p></li>
										<li><p>Pricing</p></li>
									</ul>
								)

								return (
									<ul key={i} className={`app col-3 row-1 ${i === 1 ? 'kip' : ''}`}>
										<li style={{backgroundImage: `url(${app.nameSrc})`}}></li>
										<li className={app.order}>{app.order ? <Icon icon='Check'/> : <Icon icon='Clear'/>}</li>
										<li className={app.budget}>{app.budget ? <Icon icon='Check'/> : <Icon icon='Clear'/>}</li>
										<li className={app.tracking}>{app.tracking ? <Icon icon='Check'/> : <Icon icon='Clear'/>}</li>
										<li className={app.vendors}>{app.vendors ? <Icon icon='Check'/> : <Icon icon='Clear'/>}</li>
										<li className={app.noSignup}>{app.noSignup ? <Icon icon='Check'/> : <Icon icon='Clear'/>}</li>
										<li className='accessability'>{
											app.accessability.map((Svg, i) => {
												return <Svg key={i}/>
											})
										}</li>
										<li><p>{app.pricing}</p></li>
									</ul>
								)
							})
						}
					</div>
		        </div>
	      	</div>
	    );
  	}
}
