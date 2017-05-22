// react/components/Modal/Modal.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';

import { AmazonFormContainer, ItemContainer, EditCartContainer, SettingsContainer, FeedbackContainer, ArchivedCartsContainer } from '../../containers';
import { Share } from '..';

export default class SignIn extends Component {

  static propTypes = {
    match: PropTypes.object.isRequired,
  }

  render() {
    // renders modal based on route
    return (
      <div className="modal">
        <Switch>
          <Route path={'/cart/:cart_id/m/item/add'} exact component={AmazonFormContainer} />
          <Route path={'/cart/:cart_id/m/:item_type/:index/:item_id/edit'} exact component={ItemContainer} />
          <Route path={'/cart/:cart_id/m/:item_type/:index/:amazon_id'} exact component={ItemContainer} />
          <Route path={'/cart/:cart_id/m/edit/:edit_cart_id'} exact component={EditCartContainer} />
          <Route path={'/cart/:cart_id/m/share'} exact component={Share} />
          <Route path={'/cart/:cart_id/m/settings'} exact component={SettingsContainer} />
          <Route path={'/cart/:cart_id/m/feedback'} exact component={FeedbackContainer} />
          <Route path={'/cart/:cart_id/m/archive'} exact component={ArchivedCartsContainer} />
        </Switch>
      </div>
    );
  }
}
