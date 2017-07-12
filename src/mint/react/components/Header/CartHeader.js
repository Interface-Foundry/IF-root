// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { SearchContainer, ButtonsContainer, RefreshContainer } from '../../containers';

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
      cart,
      selectTab
    } = this.props;

    return (
      <span className='cart'>
          <Link to={`/cart/${cart.id}`} onClick={()=> selectTab('cart')}>
            <div className={'image desktop'} style={{
              backgroundImage: 'url(//storage.googleapis.com/kip-random/website/logo_for_blue_bg.svg)'
            }}>
              <span className='beta'>beta</span>
            </div> 
            <div className={'image mobile'} style={{
              backgroundImage: 'url(//storage.googleapis.com/kip-random/headtrans.png)'
            }}>
              <span className='beta'>beta</span>
            </div>
          </Link>
          <SearchContainer />
          <RefreshContainer />
          {showCheckout ? <ButtonsContainer checkoutOnly={true} /> : null}       
      </span>
    );
  }
}
