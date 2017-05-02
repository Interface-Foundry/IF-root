/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { DefaultPlayer as Video } from 'react-html5video';

import { Icon } from '../../themes';

export default class About extends Component {

  	render() {
	    return (
	      	<div className="services"> 
	      		<div className="col-12 row-1 video">
			        <iframe width="100%" height="315"
						src="https://www.youtube.com/embed/QPlBeTJqF1Y">
					</iframe>
				</div>
				<div className="col-12">
					<h1>Change the way you organize your team</h1>
			        <div className="col-4 row-1 services__details">
			        	<Icon icon='GraphDown'/>
		        		<h2>Manage Your Burn Rate</h2>
			        	<p>When you’re busy building ideas, it’s easy to forget how much things cost. Kip saves you money and sets budgets for lunch and office essentials. Grow your team and keep costs lean.</p>
			        </div>

			       	<div className="col-4 row-1 services__details">
				       	<Icon icon='Clock'/>
			        	<h2>Onboard in Seconds</h2>
			       		<p>It’s hard to get everyone using new software, that’s why Kip requires no downloads or sign-ups. Just add Kip to your Slack team and get started in seconds. Kip will on-board your team, send follow ups and collect orders on your behalf.</p>
			        </div>

			       	<div className="col-4 row-1 services__details">
			       		<Icon icon='Happy'/>
				       	<h2>100% Free</h2>
			       		<p>Kip is a 100% free workplace solution because our retail partners pay the fees. We’re small, so understand the challenge of managing costs as you grow. Now you can easily scale up without worrying about cost.</p>
			        </div>
			       	<div className="col-12 row-1 action">
		        		<button>
		        			Explore how Kip can help you
		        			&nbsp;<Icon icon='Right'/>
		        		</button>
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