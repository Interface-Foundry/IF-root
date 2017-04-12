import React, { PropTypes, Component } from 'react';
import { Route } from 'react-router';
import { getNameFromEmail } from '../../utils';
import { Icon } from '..';

export default class Header extends Component {
  static propTypes = {
    leader: PropTypes.object
  }

  render() {
    const { props } = this;
    const { match } = props;
    return (
      <nav className='navbar'>
        <Route path={`${match.url}/m/item`} component={() => <ModalHead text={'Add to Cart'} {...props}/>} />
        <Route path={`${match.url}/m/deal`} component={() => <ModalHead text={'Add to Cart'} {...props}/>} />
        <Route path={`${match.url}/m/share`} component={() => <ModalHead text={'Share Cart'} {...props}/>} />
        <Route path={`${match.url}`} exact component={() => <CartHead {...props}/>}/>
      </nav>
    );
  }
}

class CartHead extends Component {
  static propTypes = {
    leader: PropTypes.object,
    _toggleSidenav: PropTypes.func
  }

  render() {
    const { leader, _toggleSidenav } = this.props;
    const leaderName = _.capitalize(getNameFromEmail(leader ? leader.email_address : null));
    return (
      <div>
        <h3>
          {leaderName}'s Group Cart
        </h3>
        <div className='navbar__icon' onClick={_toggleSidenav}>
          <Icon icon='Hamburger'/>
        </div>
      </div>
    );
  }
}

class ModalHead extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    history: PropTypes.object,
    text: PropTypes.string.isRequired
  }

  render() {
    const { cart_id, history: { replace }, text } = this.props;
    return (
      <div className='navbar__modal'>
        <div className='navbar__icon__close' onClick={()=>replace(`/cart/${cart_id}/`)}>
          <Icon icon='Clear'/>
        </div>
        <h3 className='navbar__modal_head'>
          {text}
        </h3>
      </div>
    );
  }
}
