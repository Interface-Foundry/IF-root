import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class CartListItem extends Component {
  static propTypes = {
    cart: PropTypes.object,
    currentCartId: PropTypes.string,
    isLeader: PropTypes.bool,
    SideNavLink: PropTypes.func
  }
  render = () => {
    const { cart: { id, thumbnail_url, name, locked, updatedAt, store, store_locale }, currentCartId, SideNavLink, isLeader } = this.props;
    return (
      <li key={id} className={`sidenav__list__${isLeader?'leader':'member'} ${id === currentCartId ? 'currentCart' : ''}`} >
        <div className={'image'} style={{
          backgroundImage: `url(${thumbnail_url || '//storage.googleapis.com/kip-random/head_smaller.png'})`
        }}/>
        <SideNavLink to={`/cart/${id}`}>
          <p>
            {name}
            {locked ? <span><br/>{moment(updatedAt).format('L')}</span> : null}
            {!locked ? <span><br/>{store} {store_locale}</span> : null}
          </p>
        </SideNavLink>
      </li>
    );
  }
}