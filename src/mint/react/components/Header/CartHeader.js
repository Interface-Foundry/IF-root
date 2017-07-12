// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { SearchContainer, ButtonsContainer } from '../../containers';

export default class Default extends Component {

  static propTypes = {
    user: PropTypes.object,
    cart: PropTypes.object,
    showAlert: PropTypes.bool,
    showCheckout: PropTypes.bool,
    _toggleLoginScreen: PropTypes.func,
    _toggleSidenav: PropTypes.func
  }

  render() {
    const {
      showCheckout,
      cart
    } = this.props;

    return (
      <span className='cart'>
          <Link to={`/cart/${cart.id}`}>
            <div className={'image desktop'} style={{
              backgroundImage: 'url(//storage.googleapis.com/kip-random/website/logo_for_blue_bg.svg)'
            }}/>
            <div className={'image mobile'} style={{
              backgroundImage: 'url(//storage.googleapis.com/kip-random/headtrans.png)'
            }}/>
          </Link>
          <SearchContainer />
          {showCheckout ? <ButtonsContainer checkoutOnly={true} /> : null}       
      </span>
    );
  }
}
