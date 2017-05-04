/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class About extends Component {

  	render() {
	    return (
	      	<div className="services"> 
				<div className="col-12">
					<h3>"Group shopping bot Kip focuses on coordinating purchases with a team so they can purchase lunch together or have an office manager authorize a supply order."<br/> - Fast Company July 13, 2016</h3>

					<div className="col-12 row-1 icons__hell">
		        		<div><Icon icon='Amazon'/></div>
		        		<div><Icon icon='Google'/></div>
		        		<div><Icon icon='Slack'/></div>
		        		<div><Icon icon='Microsoft'/></div>
		        		<div><Icon icon='Delivery'/></div>
		        	</div>

			        <div className="col-6 row-1 services__details">
			        	<div className="image" style={{backgroundImage: 'url("https://s3.amazonaws.com/assets-chachat/moneycartClip.png")'}}/ >
		        		<h2>TRACK SPENDING</h2>
			        	<p>Save money and track spending with Kip. See how much you’re spending in every order, save on shipping and account fees with shared shopping carts.</p>
			        </div>

			       	<div className="col-6 row-1 services__details">
				       	<div className="image" style={{backgroundImage: 'url("https://s3.amazonaws.com/assets-chachat/cloudClip.png")'}}/ >
			        	<h2>KEEP IT IN CLOUD</h2>
			       		<p>Use Kip to keep things you love in the cloud. Browse through different products, save things you’re interested in and checkout when the price is right.</p>
			        </div>

			        <div className="col-6 row-1 services__details card">
			        	<div className="image" style={{backgroundImage: 'url("https://s3.amazonaws.com/assets-chachat/directClip.png")'}}/ >
		        		<h2>Kip Direct</h2>
		        		<p>No installs or download</p>
			        	<p>Unique short URL to share</p>
			        	<p>Invite friends with link or email</p>
			        	<div className="col-12 row-1 action">
			        		<button><a href='/newcart'>Try Kip for Free</a></button>
		        		</div>
			        </div>

			       	<div className="col-6 row-1 services__details card">
				       	<div className="image" style={{backgroundImage: 'url("https://s3.amazonaws.com/assets-chachat/slackClip.png")'}}/ >
			        	<h2>Kip for Slack</h2>
			        	<p>Great for teams already on Slack</p>
			        	<p>Chat with Kip bot for essentials</p>
			        	<p>Coordinate lunch delivery</p>
			        	<div className="col-12 row-1 action">
			        		<button className="slack"><a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank">Add to Slack</a></button>
			        	</div>
			        </div>

			       	<div className="col-12 row-1 services__details card">
			        	<h2>Learn More</h2>
		        		<iframe width="560" height="315" src="https://www.youtube.com/embed/QPlBeTJqF1Y?rel=0&amp;showinfo=0" frameBorder="0" allowFullScreen></iframe>
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
