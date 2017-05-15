/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class About extends Component {

  	render() {
	    return (
	      	<div className="services"> 
				<div className="col-12">

					<h3><em>"Group shopping bot Kip focuses on coordinating purchases with a team so they can purchase lunch together or have an office manager authorize a supply order."</em><br/><span> - Fast Company July 13, 2016</span></h3>

					<h1>Featured Partners</h1>
					<div className="col-12 row-1 icons__hell">
		        		<div><Icon icon='Amazon'/></div>
		        		<div><Icon icon='Google'/></div>
		        		<div><Icon icon='Slack'/></div>
		        		<div><Icon icon='Microsoft'/></div>
		        		<div><Icon icon='Delivery'/></div>
		        	</div>

			        <div className="col-6 row-1 services__details card">
			        	<div className="image" style={{backgroundImage: 'url("https://storage.googleapis.com/kip-random/website/directClip.png")'}}/ >
		        		<h2>Kip Direct</h2>
		        		<p>No installs or download</p>
			        	<p>Unique short URL to share</p>
			        	<p>Invite friends with link or email</p>
			        	<div className="col-12 row-1 action">
			        		<a href='/newcart'><button>Create New Cart <Icon icon='Right'/></button></a>
		        		</div>
			        </div>

			       	<div className="col-6 row-1 services__details card">
				       	<div className="image" style={{backgroundImage: 'url("https://storage.googleapis.com/kip-random/website/slackClip.png")'}}/ >
			        	<h2>Kip for Slack</h2>
			        	<p>Great for teams already on Slack</p>
			        	<p>Chat with Kip bot for essentials</p>
			        	<p>Coordinate lunch delivery</p>
			        	<div className="col-12 row-1 action">
			        		<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button className="slack">Add to Slack</button></a>
			        	</div>
			        </div>

			       	<div className="col-12 row-1 services__details card video">
			        	<h2>Learn More</h2>
		        		<iframe width="100%" height="100%" src="https://www.youtube.com/embed/QPlBeTJqF1Y?rel=0&amp;showinfo=0" frameBorder="0" allowFullScreen></iframe>
			        </div>
		        </div>
		        <svg className="sine" width="100%" height="50px" viewBox="0 0 100 31" preserveAspectRatio="none">
					<g>
						<path d="M0,26.5c9.7,3.8,20.3,4.2,30.3,0.9c1.9-0.6,3.8-1.4,5.7-2.2c10.6-4.5,20.7-10.2,31.1-15.1s21.4-9,32.9-10
							v31.7H0V26.5z"/>
					</g>
				</svg>
	      	</div>
	    );
  	}
}
