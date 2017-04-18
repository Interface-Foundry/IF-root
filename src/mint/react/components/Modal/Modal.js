import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router';

import { EmailFormContainer, AmazonFormContainer, ItemContainer } from '../../containers';
import { Share } from '..';

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
          <Route path={`${match.url}/:item_type/:index/:item_id/edit`} exact component={ItemContainer} />
          <Route path={`${match.url}/:item_type/:index/:amazon_id`} component={ItemContainer} />
          <Route path={`${match.url}/signin`} component={EmailFormContainer} />
          <Route path={`${match.url}/share`} component={Share} />
        </Switch>
      </div>
    );
  }
}
