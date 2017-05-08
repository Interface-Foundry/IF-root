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
  		const icons = {
			'Burger': Burger,
			'Clock': Clock,
			'DesktopIcon': DesktopIcon,
			'Happy': Happy,
			'Layers': Layers,
			'Milk': Milk,
			'Mouse': Mouse,
			'Paper': Paper,
			'Pencil': Pencil,
			'Pizza': Pizza,
			'Happy': Happy,
			'Lightbulb': Lightbulb
  		},
  		{ animate } = this.props;

	    return (
	      	<div className="about"> 
	      		{
	      			_.map(icons, (Icon, key) => {
	      				console.log(key)
	      				return <div key={key} className={`${key} ${animate ? '' : ''}`}><Icon/></div>
	      			})
	      		}
	      	</div>
	    );
  	}
}