/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Footer extends Component {

  	render() {
	    return (
	      	<footer className="footer"> 
	      		<p><b><a href="/legal">Terms of Use</a> – <a href="https://medium.com/@kipsearch/">Blog</a> - <a href="https://kip11.typeform.com/to/wYrY5w">Become a Partner</a></b></p>
	      		<p>Kip © 2017 – Contact: hello@kipthis.com</p>
	      		<div className="footer__icons">
	      			<Icon icon='Email'/>
	      			<Icon icon='Github'/>
	      			<Icon icon='Linkedin'/>
	      		</div>
	      	</footer>
	    );
  	}
}