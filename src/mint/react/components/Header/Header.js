// react/components/Header/Header.js

import React, { Component } from 'react';
import {
  PropTypes
} from 'prop-types';
import { Route } from 'react-router';
import CartHeader from './CartHeader';
import SettingsHeader from './SettingsHeader';
import { Icon, AlertBubble } from '../../../react-common/components';

export default class Header extends Component {

  static propTypes = {
    numCarts: PropTypes.number,
    cart: PropTypes.object,
    user: PropTypes.object,
    _toggleLoginScreen: PropTypes.func,
    _toggleSidenav: PropTypes.func
  }

  state = {
    showAlert: false
  }

  componentWillReceiveProps = ({ numCarts }) =>
    this.setState({ showAlert: !!(this.props.numCarts && numCarts > this.props.numCarts) });

  render = () => {
    const {
      state: { showAlert },
      props: {
        user,
        _toggleLoginScreen,
        _toggleSidenav
      }
    } = this;
    return (
      <nav className='navbar'>
        <div className='header__left'>
          <Route path={'/cart/:cart_id'} exact component={() =>
            <CartHeader {...this.props} showAlert={this.state.showAlert}/> 
            }
          />
          <Route path={'/cart/:cart_id/m/edit'} exact component={() => 
              <SettingsHeader text='Edit Cart Settings' icon="Settings" {...this.props}/>
            }
          />
          <Route path={'/cart/:cart_id/m/share'} exact component={() => 
              <CartHeader {...this.props} showAlert={this.state.showAlert}/> 
            }
          />
          <Route path={'/newcart'} exact component={() => 
              <SettingsHeader text='Select Store' icon="Settings" {...this.props}/>
            }
          />
          <Route path={'/m/settings'} exact component={() => 
              <SettingsHeader text='Edit My Settings' icon="Settings" {...this.props}/>
            }
          />
          <Route path={'/m/archive'} exact component={() => 
              <SettingsHeader text='My Locked Carts' icon='Locked' {...this.props}/>
            }
          />
          <Route path={'/m/feedback'} exact component={() => 
              <SettingsHeader text='Feedback' icon="Email" {...this.props}/>
            }
          />
        </div>
        <div className='header__right'>
            {!user.name ? <p onClick={() => _toggleLoginScreen()}><span>Login</span></p> : null}
            <div className='navbar__icon' onClick={_toggleSidenav}>
              <Icon icon='Hamburger'/>
              {showAlert ? <AlertBubble top={13} right={25} /> : null}
            </div>
        </div>
        <span className='beta'>
          beta
        </span>
      </nav>
    );
  }

}
