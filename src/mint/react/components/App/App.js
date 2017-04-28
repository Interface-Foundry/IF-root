// mint/react/components/App/App.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import { CartContainer } from '../../containers';
import { Overlay, Modal } from '..';
import Header from './Header';
import Sidenav from './Sidenav';
import Footer from './Footer';

//Analytics!
import ReactGA from 'react-ga';

export default class App extends Component {

  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    leader: PropTypes.object,
    carts: PropTypes.arrayOf(PropTypes.object),
    modal: PropTypes.string,
    cartName: PropTypes.string,
    newAccount: PropTypes.bool,
    currentUser: PropTypes.object,
    match: PropTypes.object.isRequired,
    fetchCart: PropTypes.func.isRequired,
    fetchAllCarts: PropTypes.func.isRequired,
    updateCart: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    session_id: PropTypes.string
  }

  state = {
    sidenav: false
  }

  _logPageView(path, userId) {
    ReactGA.set({ userId });
    ReactGA.event({
      category: 'User',
      action: 'Initial Load'
    });
    ReactGA.set({ page: path });
    ReactGA.pageview(path);
  }

  _toggleSidenav = () => {
    const { sidenav } = this.state;
    this.setState({ sidenav: !sidenav });
  }

  componentWillMount() {
    const { fetchCart, fetchAllCarts, cart_id, } = this.props;

    if (cart_id) fetchCart(cart_id);
    fetchAllCarts();
  }

  componentWillReceiveProps(nextProps) {
    const { _logPageView, props: { fetchCart, fetchAllCarts, cart_id, session_id, location: { pathname } } } = this;
    const { cart_id: nextCart_id, session_id: nextSessionId } = nextProps;

    if (!session_id && nextSessionId) {
      ReactGA.initialize('UA-97839751-1', { //TODO: change to Kip id!
        gaOptions: {
          userId: nextSessionId
        }
      });

      _logPageView(pathname, nextSessionId); //log initial load
    }
    if (cart_id !== nextCart_id) {
      fetchCart(nextCart_id);
      fetchAllCarts();
    }
  }

  render() {
    const { props, state, _toggleSidenav } = this;
    const { cart_id, currentCart, updateCart, newAccount, leader, carts, match, currentUser, location, logout, items, history: { replace } } = props;
    const { sidenav } = state;
    const showFooter = !location.pathname.includes('/m/edit');

    if (newAccount === false) {
      return <Overlay/>;
    }

    return (
      <section className='app'>

        <Header {...props}  _toggleSidenav={ _toggleSidenav} />
        { sidenav ? <Sidenav cart_id={cart_id} logout={logout} leader={leader} carts={carts} _toggleSidenav={_toggleSidenav} currentUser={currentUser} replace={replace} itemsLen={items.length} currentCart={currentCart} updateCart={updateCart} /> : null }
        <div className={`app__view ${showFooter ? '' : 'large'}`}>
          { /* Renders modal when route permits */ }
          <Route path={`${match.url}/m/`} component={Modal} />

          { /* Renders cart when route permits */ }
          <Route path={`${match.url}`} exact component={CartContainer} />
        </div>

        {showFooter ? <Footer {...props} cart_id={cart_id}/> : null}
      </section>
    );
  }
}
