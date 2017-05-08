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

  	render() {
  		const icons = [
			Burger,
			Clock,
			DesktopIcon,
			Happy,
			Layers,
			Milk,
			Mouse,
			Paper,
			Pencil,
			Pizza,
			Happy,
			Lightbulb
  		],
  		{ animate } = this.props,
  		lastIndex = icons.length - 1;

	    return (
	      	<div className="about"> 
	      		{
	      			_.map(icons, (Icon, i) => {
	      				return <div key={Icon.name + i} className={`${Icon.name} ${i === lastIndex && animate ? '' : ''}`}><Icon/></div>
	      			})
	      		}
	      	</div>
	    );
  	}
}