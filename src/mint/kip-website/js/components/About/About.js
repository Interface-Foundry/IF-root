/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

import { 
	Burger,
	Clock,
	DesktopIcon,
	Happy,
	Layers,
	Lightbulb,
	Milk,
	Mouse,
	Paper,
	Pencil,
	Pizza
} from '../../themes/kipsvg';


export default class About extends Component {

	shouldComponentUpdate(nextProps, nextState) {
		return false;
	}

  	render() {
  		const icons = {
			Burger,
			Clock,
			DesktopIcon,
			Happy,
			Layers,Milk,
			Mouse,
			Paper,
			Pencil,
			Pizza,
			Happy,
			Lightbulb
  		},
  		{ animate } = this.props;

	    return (
	      	<div className="about"> 
	      		{
	      			_.map(icons, (Icon, key) => {
	      				return <div key={key} style={{width: `${Math.floor(Math.random() * (40 - 20)) + 20}%`}}className={`icon ${animate ? '' : ''}`}><Icon/></div>
	      			})
	      		}
	      	</div>
	    );
  	}
}