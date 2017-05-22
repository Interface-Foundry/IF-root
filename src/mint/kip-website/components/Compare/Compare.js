/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';
import { Gift, Home, Stats, Right, Brush, Banner, Delete, Check } from '../../themes/newSvg';
import {
  Facebook,
  Outlook,
  Chrome,
  SlackIcon,
  Gmail,
  Apple,
  GooglePlay
} from '../../themes';

const comparisonArray = [
	{
		nameSrc: 'https://storage.googleapis.com/kip-random/website/chart_kip.svg',
		order: true,
		budget: true,
		tracking: true,
		vendors: true,
		noSignup: true,
		accessability: [Facebook, Gmail, SlackIcon, Chrome],
		pricing: 'FREE'
	},
	{
		nameSrc: 'https://storage.googleapis.com/kip-random/website/chart_hivy.svg',
		order: true,
		budget: true,
		tracking: false,
		vendors: false,
		noSignup: false,
		accessability: [SlackIcon, Apple],
		pricing: 'Credit Card Required'
	},
	{
		nameSrc: 'https://storage.googleapis.com/kip-random/website/chart_q.svg',
		order: true,
		budget: false,
		tracking: false,
		vendors: true,
		noSignup: false,
		accessability: [GooglePlay, Apple],
		pricing: 'Credit Card Required'
	}
]

export default class Compare extends Component {

  	render() {
	    return (
	      	<div className="compare col-12"> 
		      	<table>
				  	<thead>
				    	<tr>
						  	<th>&nbsp;</th>
					  		{
					  			comparisonArray.map((app) => (
					  				<th>
					  					<div className="image" style={{backgroundImage: `url(${app.nameSrc})`}}/>
					  				</th>
					  			))
					  		}
				    	</tr>
					</thead>
				  	<tbody>
					  	<tr>
					  		<td>Order Management</td>
				  			{
					  			comparisonArray.map((app) => (
					  				app.order ? <td className='check'> <Check/> </td> : <td>  <Delete/> </td>
					  			))
					  		}
				  		</tr>
					    <tr>
					      	<td>Budget Setting</td>
				  			{
					  			comparisonArray.map((app) => (
					  				app.budget ? <td className='check'> <Check/> </td> : <td> <Delete/> </td>
					  			))
					  		}
					    </tr>
					    <tr>
					      	<td>Track Orders</td>
				  			{
					  			comparisonArray.map((app) => (
					  				app.tracking ? <td className='check'> <Check/> </td> : <td> <Delete/> </td>
					  			))
					  		}
					    </tr>
					    <tr>
					      	<td>Multiple Vendors</td>
				  			{
					  			comparisonArray.map((app) => (
					  				app.vendors ? <td className='check'> <Check/> </td> : <td> <Delete/> </td>
					  			))
					  		}
					    </tr>
					    <tr>
					      	<td>No Signup/Download</td>
				  			{
					  			comparisonArray.map((app) => (
					  				app.noSignup ? <td className='check'> <Check/> </td> : <td> <Delete/> </td>
					  			))
					  		}
					    </tr>
					    <tr>
					      	<td>Accessibility</td>
					      	{
					  			comparisonArray.map((app) => (
					  				<td> 
					  					{
					      					app.accessability.map((Svg, i) => {
												return <Svg key={i}/>
											})
					  					}
					  				</td>
					  			))
					  		}
					    </tr>
					    <tr>
					      	<td>Pricing</td>
			  			{
					  			comparisonArray.map((app) => (
					  				<td className='price'> { app.pricing } </td>
					  			))
					  		}
					    </tr>
				  	</tbody>
				</table>
	      	</div>
	    );
  	}
}
