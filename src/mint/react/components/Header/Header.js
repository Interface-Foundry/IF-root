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
    numCarts: PropTypes.number,
    cart: PropTypes.object,
    user: PropTypes.object
  }

  state = {
    showAlert: false
  }

  componentWillReceiveProps(nextProps) {
    const { numCarts: nextNumCarts } = nextProps, { numCarts } = this.props;
    this.setState({ showAlert: !!(numCarts && nextNumCarts > numCarts) });
  }

  render = () => (
    <nav className='navbar'>
      <Route path={'/cart/:cart_id'} exact component={() =>
        <Default {...this.props} showAlert={this.state.showAlert}/> 
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
      <Route path={'/m/settings'} exact component={() => 
          <SettingsHeader text='Edit My Settings' icon="Settings" {...this.props}/>
        }
      />
      <Route path={'/m/archive'} exact component={() => 
          <SettingsHeader text='My Archived Carts' icon='Locked' {...this.props}/>
        }
      />
      <Route path={'/m/feedback'} exact component={() => 
          <SettingsHeader text='Feedback' icon="Email" {...this.props}/>
        }
      />
      <span className='beta'>
        beta
      </span>
    </nav>);

}
