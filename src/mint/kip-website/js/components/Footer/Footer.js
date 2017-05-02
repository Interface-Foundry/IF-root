/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Footer extends Component {

  	render() {
	    return (
	      	<footer className="footer"> 
	      		<p>Copyright © 2006-2017 John S. and James L. Knight Foundation. Other copyrights apply where noted.</p>
				<p>This work is licensed under a Creative Commons Attribution-NonCommercial 4.0 International License.</p>
	      		<div className="footer__icons">
	      			<Icon icon='Email'/>
	      			<Icon icon='Github'/>
	      			<Icon icon='Linkedin'/>
	      		</div>
	      	</footer>
	    );
  	}
}