/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Showcase extends Component {

  	render() {
	    return (
	      	<div className="showcase"> 
	      		<h1>GROW WITH US AND OUR PARTNERS</h1>

	      		<div className="col-12 row-1 icons__hell">
	        		<div><Icon icon='Amazon'/></div>
	        		<div><Icon icon='Google'/></div>
	        		<div><Icon icon='Slack'/></div>
	        		<div><Icon icon='Microsoft'/></div>
	        		<div><Icon icon='Delivery'/></div>
	        	</div>

		        <div className="col-6 row-1 showcase__details right">
		        	<div className="col-12 row-1 text">
			        	<Icon icon='Dummy'/>
			        	<div className="services__text">
		        			<h2 className="col-4">KIP MINT</h2>
			        		<p>Use advanced machine learning that learns from 100,000+ global businesses to help your company beat fraud</p>
			        	</div>
			        	<button>
		        			Check out Kip on Web
		        			&nbsp;<Icon icon='Right'/>
		        		</button>
	        		</div>
		        </div>

		       	<div className="col-6 row-1 showcase__details">
		       		<div className="col-12 row-1 text">
				       	<Icon icon='Dummy'/>
			        	<div className="services__text">
		        			<h2 className="col-4">KIP SLACK</h2>
							<p>Use advanced machine learning that learns from 100,000+ global businesses to help your company beat fraud</p>
			        	</div>
			        	<button>
		        			Check out Kip on Slack
		        			&nbsp;<Icon icon='Right'/>
		        		</button>
		        	</div>
		        </div>
	      	</div>
	    );
  	}
}