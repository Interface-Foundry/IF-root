/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class About extends Component {

  	render() {
	    return (
	      	<div className="about"> 
	      		<div className="col-12 about__header">
			      	<h1 className="col-12">ABOUT KIP</h1>
			      	<p>At kip we believe in the importance of transparency and accountability in the workplace.</p>
		      	</div>
	        	<h2 className="col-12">WE BELIEVE</h2>
		        <div className="col-12 row-1 about__details">
		        	<Icon icon='Believe'/>
		        	<p>At Kip, we believe that your success is our success, and are proactive in delivering results. With our analytics, we can monitor item performance, purchase frequency and other data points to optimize your go-to-market.</p>
		        </div>

	        	<h2 className="col-12">WE SUPPORT</h2>
		       	<div className="col-12 row-1 about__details">
			       	<Icon icon='Support'/>
		       		<p>As our partner, you’ll instantly gain access to new potential customers through messaging. Kip provides a unique marketing audience opportunity as teams tend to purchase more and in larger volume. Be part of technology frontier, and join us in conversation commerce.</p>
		        </div>

		       	<h2 className="col-12">WE EMPOWER</h2>
		       	<div className="col-12 row-1 about__details">
		       		<Icon icon='Empower'/>
		       		<p>New technologies are exciting, but not always easy to work with. Kip lets you seamlessly integrate your inventory. We support every kind of goods and services transaction ranging from hard packaged goods to on demand delivery, bookings, and reservations. Effortlessly integrate with us for an instant chat bot strategy.</p>
		        </div>

	        	<div className="col-12 row-1 about__action">
	        		<button>
	        			START USING KIP
	        		</button>
	        	</div>
	      	</div>
	    );
  	}
}