import React, { PropTypes, Component } from 'react';
import { getNameFromEmail } from '../../utils';
import { Icon } from '..';

export default class Header extends Component {
  static propTypes = {
    leader: PropTypes.object
  }

  render() {
    const { leader, _toggleSidenav } = this.props;

    const leaderName = _.capitalize(getNameFromEmail(leader ? leader.email_address : null));

    return (
      <nav className='navbar'>
        <h3>
          {leaderName}'s Group Cart
        </h3>
        <div className='navbar__icon' onClick={_toggleSidenav}>
          <Icon icon='Hamburger'/>
        </div>
      </nav>
    );
  }
}
