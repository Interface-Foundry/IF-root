/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Footer extends Component {

  	render() {
	    return (
	      	<footer className="footer"> 
	      		<p>Privacy - Terms of Service - Blog - About - Partners</p>
	      		<div className="footer__icons">
	      			<Icon icon='Email'/>
	      			<Icon icon='Github'/>
	      			<Icon icon='Linkedin'/>
	      		</div>
	      	</footer>
	    );
  	}
}