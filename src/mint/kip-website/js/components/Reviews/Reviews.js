/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

const services = [
	'Item',
	'Service',
	'Food',
	'Bird',
	'Peanut',
	'Veggie',
	'Sphinx',
	'HiChew'
]

export default class Reviews extends Component {

  	render() {
	    return (
	      	<div className="reviews"> 
		        <ul className="col-12 row-1">
		        	{_.map(services, (s) => (
			        	<li key={s}>
			        		<div className="image row-1" style={
				                {
				                  backgroundImage: `url(http://placehold.it/350x150)`
				                }}/>
			        	</li>
		        	))}
		        </ul>
	      	</div>
	    );
  	}
}