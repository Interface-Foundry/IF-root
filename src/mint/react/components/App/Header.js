import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
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
      <Switch>
        <Route path={`${match.url}/m/item/:index/:asin`} component={() => <EnumeratedHead text={'Your Cart'} {...props}/>} />
        <Route path={`${match.url}/m/item`} component={() => <ModalHead text={'Add to Cart'} {...props}/>} />
        <Route path={`${match.url}/m/deal/:index/:dealId`} component={() => <EnumeratedHead text={'Daily Deals'} {...props}/>} />
        <Route path={`${match.url}/m/share`} component={() => <ModalHead text={'Share Cart'} {...props}/>} />
        <Route path={`${match.url}`} exact component={() => <CartHead {...props}/>}/>
        </Switch>
      </nav>
    );
  }
}

class CartHead extends Component {
  static propTypes = {
    leader: PropTypes.object,
    _toggleSidenav: PropTypes.func,
    currentUser: PropTypes.object
  }

  render() {
    const { leader, _toggleSidenav, currentUser } = this.props;
    const leaderName = _.capitalize(getNameFromEmail(leader ? leader.email_address : null));
    return (
      <div>
        <h3>
          {leaderName}'s Group Cart
        </h3>
        {
          currentUser ? <div className='navbar__icon' onClick={_toggleSidenav}>
            <Icon icon='Hamburger'/>
          </div> : null
        }
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

class EnumeratedHead extends Component {
  static propTypes = {
    cart_id: PropTypes.string,
    history: PropTypes.object,
    deals: PropTypes.array,
    text: PropTypes.string,
    location: PropTypes.object,
  }

  render() {
    let { cart_id, history: { replace }, text, location: { pathname }, deals, items } = this.props,
      isItem = pathname.split('/')[pathname.split('/').length - 1] === 'edit',
      itemIndex = parseInt(pathname.split('/')[pathname.split('/').length - (isItem ? 3 : 2)]) + 1;
    items = items ? items : [];
    console.log(this.props);
    return (
      <div className='navbar__modal'>
        <div className='navbar__icon__close' onClick={()=>replace(`/cart/${cart_id}/`)}>
          <Icon icon='Clear'/>
        </div>
        <h3 className='navbar__modal_head'>
          {text} - {itemIndex} of { (isItem ? items.length : deals.length) || 0}
        </h3>
      </div>
    );
  }
}
