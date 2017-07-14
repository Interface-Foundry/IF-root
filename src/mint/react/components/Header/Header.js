// react/components/Header/Header.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Route } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import CartHeader from './CartHeader';
import SettingsHeader from './SettingsHeader';
import { ButtonsContainer } from '../../containers';

import { Icon /*, AlertBubble */ } from '../../../react-common/components';

export default class Header extends Component {

  static propTypes = {
    numCarts: PropTypes.number,
    userName: PropTypes.string,
    cartId: PropTypes.string,
    _toggleLoginScreen: PropTypes.func,
    _toggleSidenav: PropTypes.func,
    showAlert: PropTypes.bool,
    showCheckout: PropTypes.bool,
    selectTab: PropTypes.func
  }

  state = {
    showAlert: false
  }

  shouldComponentUpdate = ({ userName, showCheckout, cartId }) =>
    userName !== this.props.userName
    || showCheckout !== this.props.showCheckout
    || cartId !== this.props.cartId

  render = () => {
    const {
      props,
      props: {
        userName,
        showCheckout,
        _toggleLoginScreen,
        _toggleSidenav
      }
    } = this;
    return (
      <nav className='navbar'>
        <div className='header__left'>
          <Route path={'/cart/:cart_id'} exact component={() =><CartHeader {...props}/> } />
          <Route path={'/cart/:cart_id/m/share'} exact component={() => <CartHeader {...props}/> } />

          <Route path={'/cart/:cart_id/m/edit'} exact component={() => 
              <SettingsHeader text='Edit Cart Settings' icon="Settings" {...props}/>
            }
          />

          <Route path={'/newcart'} exact component={() => 
              <SettingsHeader text='Select Store' icon="Settings" {...props}/>
            }
          />
          <Route path={'/m/settings'} exact component={() => 
              <SettingsHeader text='Edit My Settings' icon="Settings" {...props}/>
            }
          />
          <Route path={'/m/archive'} exact component={() => 
              <SettingsHeader text='My Locked Carts' icon='Locked' {...props}/>
            }
          />
          <Route path={'/m/feedback'} exact component={() => 
              <SettingsHeader text='Feedback' icon="Email" {...props}/>
            }
          />
        </div>
        <TransitionGroup>
          {
            showCheckout 
            ? (<CSSTransition classNames='checkoutButton' timeout={{enter: 450, exit: 450}} >
                <ButtonsContainer checkoutOnly={true}/>
              </CSSTransition>)
             : null
           }
        </TransitionGroup>
        <div className='header__right'>
            {!userName ? <p onClick={() => _toggleLoginScreen()}><span>Login</span></p> : null}
            <div className='navbar__icon' onClick={_toggleSidenav}>
              <Icon icon='Hamburger'/>
               {/* showAlert ? <AlertBubble top={13} right={25} /> : null */}
            </div>
        </div>
      </nav>
    );
  }

}
