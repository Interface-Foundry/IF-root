import React, { PropTypes, Component } from 'react';
import { Route } from 'react-router';

import { CartContainer } from '../../containers';
import { Overlay, Modal } from '..';
import Header from './Header';

export default class App extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    leader: PropTypes.object,
    modal: PropTypes.string,
    newAccount: PropTypes.bool,
    match: PropTypes.object.isRequired
  }

  render() {
    const { cart_id, newAccount, leader, match } = this.props;

    if (newAccount === false) {
      return <Overlay/>;
    }

    return (
      <section className='app'>
        <Header cart_id={cart_id} leader={leader} />

        { /* Renders modal when route permits */ }
        <Route path={`${match.url}cart/:cart_id/m/`} component={Modal} />

        { /* Renders cart when route permits */ }
        <Route path={`${match.url}cart/:cart_id/`} exact component={CartContainer} />
      </section>
    );
  }
}
