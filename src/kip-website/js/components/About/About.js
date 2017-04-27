/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class About extends Component {

  	render() {
	    return (
	      	<div className="about"> 
	        	<h2>WE SUPPORT</h2>
		        <div className="col-12 row-1 about__details">
		        	<p>Informed and Transparent Communities that Strength and Empower</p>
		        </div>

	        	<h2>WE BELIEVE</h2>
		       	<div className="col-12 row-1 about__details">
		       		<p className="col-4">In the flying purple people eater <br/> Grumpy elves that work for santa <br/> That the moon is made of cheese</p>
		        </div>

	        	<h2>GROW WITH US</h2>
	        	<div className="col-12 row-1 about__action">
	        		<button>
	        			START USING KIP
	        		</button>
	        	</div>
	      	</div>
	    );
  	}
}