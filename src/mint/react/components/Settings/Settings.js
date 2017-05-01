// react/components/Settings/Settings.js

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { Icon } from '..';

export default class Settings extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    currentUser: PropTypes.object,
  }

  render() {
    const { cart_id, currentUser } = this.props;
    return (
      <div className='settings'>
        <ul>
          <li>{currentUser.email_address}  &nbsp;<Icon icon='Edit'/></li>
          <li><Link to={`/cart/${cart_id}/m/Feedback`}><Icon icon='Email'/> &nbsp; Send Feedback</Link></li>
        </ul>
        <h4>Kip Version 1.3 (Mint)</h4>
      </div>
    );
  }
}
