// react/components/Modal/Modal.js

import React, { Component } from 'react';
import { Route } from 'react-router';

import { SettingsContainer, FeedbackContainer, EditCartContainer } from '../../containers';
import { Share } from '..';

export default class SignIn extends Component {
  render() {
    // renders modal based on route
    return (
      <div className="modal">
        <Route path={'/cart/:cart_id/m/share'} exact component={Share} />
        <Route path={'/cart/:cart_id/m/settings'} exact component={SettingsContainer} />
        <Route path={'/cart/:cart_id/m/feedback'} exact component={FeedbackContainer} />
        <Route path={'/cart/:cart_id/m/edit'} exact component={EditCartContainer} />
      </div>
    );
  }
}
