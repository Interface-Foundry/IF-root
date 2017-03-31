import React, { PropTypes, Component } from 'react';
import { getNameFromEmail } from '../../utils'

export default class Header extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired
  }

  render() {
    const { cart_id, leader } = this.props;

    const leaderName = _.capitalize(getNameFromEmail(leader ? leader.email_address : null));
    
    return (
      <nav className='navbar'>
        <h1>
          {leaderName}'s Group Cart
        </h1>
      </nav>
    );
  }
}
