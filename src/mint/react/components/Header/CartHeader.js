// react/components/App/Header.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { SearchContainer, RefreshContainer } from '../../containers';


export default class CartHeader extends Component {

  static propTypes = {
    cartId: PropTypes.string,
    showAlert: PropTypes.bool,
    showCheckout: PropTypes.bool,
    selectTab: PropTypes.func
  }

  render() {
    const {
      cartId,
      selectTab
    } = this.props;

    return (
      <span className='cartHead'>
        <Link to={`/cart/${cartId}`} onClick={()=> selectTab('cart')}>
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
      </span>
    );
  }
}
