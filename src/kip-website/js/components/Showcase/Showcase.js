/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Showcase extends Component {

  	render() {
	    return (
	      	<div className="showcase"> 
		        <div className="row-1 showcase__details">
		        	<Icon icon='Dummy'/>
		        	<div className="services__text">
	        			<h2 className="col-4">MINT</h2>
		        		<p>Use advanced machine learning that learns from 100,000+ global businesses to help your company beat fraud</p>
		        	</div>
		        	<button>
	        			KIP MINT
	        			&nbsp;<Icon icon='Right'/>
	        		</button>
		        </div>

		       	<div className="row-1 showcase__details">
			       	<Icon icon='Dummy'/>
		        	<div className="services__text">
	        			<h2 className="col-4">SLACK</h2>
						<p>Use advanced machine learning that learns from 100,000+ global businesses to help your company beat fraud</p>
		        	</div>
		        	<button>
	        			KIP SLACK
	        			&nbsp;<Icon icon='Right'/>
	        		</button>
		        </div>
	      	</div>
	    );
  	}
}