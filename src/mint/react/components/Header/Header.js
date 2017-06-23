// react/components/Header/Header.js

import React, { Component } from 'react';
import {
  PropTypes
} from 'prop-types';
import { Route } from 'react-router';
import Default from './Default';
import SettingsHeader from './SettingsHeader';

export default class Header extends Component {

  static propTypes = {
    numCarts: PropTypes.bool
  }

  state = {
    showAlert: false
  }

  componentWillReceiveProps(nextProps) {
    const { numCarts: nextNumCarts } = nextProps, { numCarts } = this.props;
    this.setState({ showAlert: !!(numCarts && nextNumCarts > numCarts) })
  }

  shouldComponentUpdate = (nextProps) =>
    this.props.numCarts !== nextProps.numCarts || this.props.cart !== nextProps.cart || this.props.user !== nextProps.user

  render() {
    return (
      <nav className='navbar'>
        <Route path={'/cart/:cart_id'} exact component={() =>  <Default {...this.props} showAlert={this.state.showAlert}/> } />
        <Route path={'/cart/:cart_id/m/settings'} exact component={() => 
            <SettingsHeader text='Edit My Settings' icon="Settings" {...this.props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/feedback'} exact component={() => 
            <SettingsHeader text='Feedback' icon="Email" {...this.props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/edit'} exact component={() => 
            <SettingsHeader text='Edit Cart Settings' icon="Settings" {...this.props}/>
          }
        />
        <Route path={'/cart/:cart_id/m/share'} exact component={() => 
            <SettingsHeader text='Share Cart' icon="Share" {...this.props}/>
          }
        />
        <Route path={'/newcart'} exact component={() => 
            <SettingsHeader text='Select Store' icon="Settings" {...this.props}/>
          }
        />
      </nav>
    );
  }
}
