// react/components/Settings/Settings.js

import React, { Component } from 'react';
import { Icon } from '..';

export default class Settings extends Component {

  render() {
  	const { cart_id, currentUser, currentCart } = this.props;
    return (
      <div className='settings'>
      	<ul>
      		<li>{currentUser.email_address}  &nbsp;<Icon icon='Edit'/></li>
      		<li><Icon icon='Email'/> &nbsp; Send Feedback</li>
      	</ul>
      	<h4>Kip Version 1.3 (Mint)</h4>
      </div>
    );
  }
}
