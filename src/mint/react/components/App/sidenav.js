import React, { PropTypes, Component } from 'react';
import {Link} from 'react-router-dom'
import { getNameFromEmail } from '../../utils';
import { Icon } from '..';


export default class Sidenav extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    leader: PropTypes.object,
    carts: PropTypes.arrayOf(PropTypes.object)
  }

  render() {
    const { leader, carts, _toggleSidenav } = this.props,
          leaderName = _.capitalize(getNameFromEmail(leader ? leader.email_address : null)),
          leaderCarts = _.filter(carts, (c) => c.leader.email_address === leader.email_address),
          memberCarts = _.filter(carts, (c) => c.leader.email_address !== leader.email_address);

    return (
      <div className='sidenav'>
        <div className='sidenav__overlay' onClick={_toggleSidenav}>
        </div>
        <ul className='sidenav__list'>
          <li className='sidenav__list__header'>
            <p>{leader.email_address}</p>
            <div className='icon' onClick={_toggleSidenav}>
              <Icon icon='Clear'/>
            </div>
          </li>
          <h4>Leader</h4>
          {_.map(leaderCarts, (c, i) => (
            <li key={i} className='sidenav__list__leader'>
              <Link to={`/cart/${c.id}`}>
                <div className='icon' onClick={_toggleSidenav}>
                  <Icon icon='Edit'/>
                </div>
              </Link>
              <p>{`${_.capitalize(getNameFromEmail(c.leader.email_address))}'s Cart (${c.items.length})`}</p>
            </li>
          ))}
          <h4>Member</h4>
          {_.map(memberCarts, (c, i) => (
            <li key={i} className='sidenav__list__leader'>
              <Link to={`/cart/${c.id}`}>
                <div className='icon' onClick={_toggleSidenav}>
                  <Icon icon='Edit'/>
                </div>
              </Link>
              <p>{`${_.capitalize(getNameFromEmail(c.leader.email_address))}'s Cart (${c.items.length})`}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}