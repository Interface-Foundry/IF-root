/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class About extends Component {

  	render() {
	    return (
	      	<div className="about"> 
	        	<h1>We Support</h1>
		        <div className="col-12 row-1 about__details">
		        	<h3>Informed and Transparent Communities that Strength and Empower</h3>
		        </div>

	        	<h1>We Believe</h1>
		       	<div className="col-12 row-1 about__details">
		       		<p>In the flying purple people eater</p>
		        	<p className='connect'>Grumpy elves that work for santa</p>
		        	<p>That the moon is made of cheese</p>
		        </div>

	        	<h1>Grow With Us</h1>
	        	<div className="col-12 row-1 about__action">
	        		<button>
	        			START USING KIP
	        		</button>
	        	</div>
	      	</div>
	    );
  	}
}