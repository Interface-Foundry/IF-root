// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import moment from 'moment';
import { calculateItemTotal, displayCost } from '../../../utils';

//Analytics!
import ReactGA from 'react-ga';

// Cart Details
// Account Details

export default class Details extends Component {

  render() {
    const { name, leader, store,  store_locale, members, items } = this.props,
          total = calculateItemTotal(items);

    return (
        <table className='details'>
          	<tr>
			    <th colSpan='100%'><span>{name}</span></th>
			</tr>
        	<tr>
	        	<td><span>Created By: {leader.name}</span></td>
	        	<td><span>Store: {store} | {store_locale}</span></td>
	        	<td><span>Number of Members: {members.length}</span></td>
            <td><span>Total: ${total}</span></td>
        	</tr>
        </table>
    );
  }
}



