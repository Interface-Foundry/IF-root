import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import { getNameFromEmail } from '../../utils';
import { Icon } from '..';

export default class Footer extends Component {
  static propTypes = {
    leader: PropTypes.object
  }

  _handleShare = () => {
    const { replace, cart_id } = this.props;

    // TRY THIS FIRST FOR ANY BROWSER
    if(navigator.share !== undefined){
        navigator.share({
            title: 'Kip Cart',
            text: "Cart Name",
            url: 'cart.kipthis.com/URL'
        }).then(() => console.log('Successful share'))
        .catch(error => console.log('Error sharing:', error));       
    } else {
      replace(`/cart/${cart_id}/m/share`)
    }
  }

  render() {
    const { _handleShare } = this;

    return (
      <footer className='footer'>
        <button onClick={_handleShare}>SHARE</button>
        <button>CHECKOUT</button>
      </footer>
    );
  }
}

