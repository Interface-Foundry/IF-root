// react/components/Header/Header.js

import React, { Component } from 'react';
import { Route } from 'react-router';
import Default from './Default';
import SettingsHeader from './SettingsHeader';

export default class Header extends Component {
  render() {
    return (
      <nav className='navbar'>
        <Route path={'/cart/:cart_id'} exact component={() =>  <Default {...this.props}/> } />
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
