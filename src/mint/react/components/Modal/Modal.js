import React, { Component, PropTypes } from 'react';
import { Route, Switch } from 'react-router';

import { Icon } from '..';
import { EmailFormContainer, AmazonFormContainer, ItemContainer } from '../../containers';

export default class SignIn extends Component {

  static propTypes = {
    match: PropTypes.object.isRequired
  }

  render() {
    const { match } = this.props;

    // renders modal based on route
    return (
      <div className="modal">
        <Switch>
          <Route path={`${match.url}/item/add`} component={AmazonFormContainer} />
          <Route path={`${match.url}/item/:item_id`} component={ItemContainer} />
          <Route path={`${match.url}/signin`} component={EmailFormContainer} />
        </Switch>
      </div>
    );
  }
}