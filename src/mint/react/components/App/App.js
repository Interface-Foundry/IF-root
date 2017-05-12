// mint/react/components/App/App.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import ReactDOM from 'react-dom';

import { CartContainer } from '../../containers';
import { Overlay, Modal, Toast, ErrorPage } from '..';
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
    session_id: PropTypes.string,
    currentCart: PropTypes.object,
    logout: PropTypes.func,
    items: PropTypes.array,
    toast: PropTypes.string,
    status: PropTypes.string,
    history: PropTypes.object
  }

  state = {
    sidenav: false,
    isMobile: false
  }

  _logPageView(path, userId) {
    ReactGA.set({ userId });
    ReactGA.event({
      category: 'User',
      action: 'Initial Load'
    });
  }

  _toggleSidenav = () => {
    const { sidenav } = this.state;
    this.setState({ sidenav: !sidenav });
  }

  componentWillMount() {
    const { props: { fetchCart, fetchAllCarts, cart_id, history: { replace } } } = this;
    if (cart_id) {
      fetchCart(cart_id)
        .then(cart => !cart ? replace('/404') : null);
    }
    fetchAllCarts();
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this)
    if (window.innerWidth < 900)
      this.setState({ isMobile: true })
  }

  componentWillReceiveProps(nextProps) {
    const {
      _logPageView,
      props: {
        fetchCart,
        fetchAllCarts,
        cart_id,
        session_id,
        location: { pathname },
        history: { replace }
      }
    } = this;
    const { cart_id: nextCart_id, session_id: nextSessionId, toast: newToast } = nextProps;

    if (!session_id && nextSessionId) {
      ReactGA.initialize('UA-51752546-10', {
        gaOptions: {
          userId: nextSessionId
        }
      });

      _logPageView(pathname, nextSessionId); //log initial load
    }
    if (cart_id !== nextCart_id) {
      fetchCart(nextCart_id)
        .then(cart => !cart ? replace('/404') : null);
      fetchAllCarts();
    }
    if (newToast && newToast.includes('Cart Updated')) fetchAllCarts();
  }

  render() {
    const {
      _toggleSidenav,
      props,
      props: {
        toast,
        status,
        cart_id,
        currentCart,
        updateCart,
        newAccount,
        leader,
        carts,
        currentUser,
        location,
        logout,
        items,
        history: { replace }
      },
      state: { sidenav, isMobile }
    } = this;
    const showFooter = !location.pathname.includes('/m/edit') || location.pathname.includes('/404');
    const showSidenav = !location.pathname.includes('/m/signin');
    if (newAccount === false) {
      return <Overlay/>;
    }
    return (
        <section className='app'>
          <Toast toast={toast} status={status} loc={location} replace={replace}/>
          <Header {...props}  _toggleSidenav={ _toggleSidenav}  isMobile={isMobile}/>
          <div className={`app__view ${showFooter ? '' : 'large'}`}>

            {/* Render Error Page */}
            <Route path={'/404'} exact component={ErrorPage} />

            { /* Renders modal when route permits */ }
            <Route path={'/cart/:cart_id/m/*'} exact component={Modal} />

            { /* Renders cart when route permits */ }
            <Route path={'/cart/:cart_id'} exact component={CartContainer} />

          </div>
          { showSidenav && ( sidenav || !isMobile ) ? <Sidenav cart_id={cart_id} replace={replace} logout={logout} leader={leader} carts={carts} _toggleSidenav={_toggleSidenav} currentUser={currentUser} itemsLen={items.length} currentCart={currentCart} updateCart={updateCart} /> : null }
          {showFooter ? <Footer {...props} cart_id={cart_id} isMobile={isMobile}/> : null}
        </section>
    );
  }
}
