// mint/react/components/App/App.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import ReactDOM from 'react-dom';

import { CartContainer, CartStoresContainer } from '../../containers';
import { Overlay, Modal, Toast, ErrorPage, Popup } from '..';

import Header from './Header';
import Sidenav from './Sidenav';
import Footer from './Footer';

//Analytics!
import ReactGA from 'react-ga';

export default class App extends Component {

  static propTypes = {
    cart_id: PropTypes.string,
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
    popup: false,
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

  _togglePopup = () => {
    const { popup } = this.state;
    this.setState({ popup: !popup });
  }

  componentWillMount() {
    const { props: { fetchCart, fetchAllCarts, cart_id, history: { replace } } } = this;
    if (cart_id) fetchCart(cart_id)
      .then(cart => { console.log({ cart });!cart ? replace('/404') : null });
    fetchAllCarts();
  }

  componentDidMount() {
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
    if (!session_id && nextSessionId && process.env.GA) {
      ReactGA.initialize('UA-51752546-10', {
        gaOptions: {
          userId: nextSessionId
        }
      });

      _logPageView(pathname, nextSessionId); //log initial load
    }
    if (cart_id !== nextCart_id && nextCart_id) {
      fetchCart(nextCart_id)
        .then(cart => !cart ? replace('/404') : null);
      fetchAllCarts();
    }
    if (newToast && newToast.includes('Cart Updated')) fetchAllCarts();
  }

  render() {
    const {
      _toggleSidenav,
      _togglePopup,
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
        login,
        items,
        history: { replace }
      },
      state: { sidenav, isMobile, popup }
    } = this;
    const showFooter = !location.pathname.includes('/m/edit') || location.pathname.includes('/404') || location.pathname.includes('newcart');
    const showSidenav = !(location.pathname.includes('/m/signin') || location.pathname.includes('newcart'));

    return (
      <section className='app'>
          <Toast toast={toast} status={status} loc={location} replace={replace}/>
          <Header {...props}  _toggleSidenav={ _toggleSidenav} _togglePopup={_togglePopup} isMobile={isMobile}/>
          {popup ? <Popup {...props} cart_id={cart_id} _togglePopup={_togglePopup}/> : null}
          <div className={`app__view ${showFooter ? '' : 'large'}`}>
            {
              newAccount === false //soon there will be no overlay
              ? <Overlay/>
              : (
                <div>
                  {/* Render Error Page */}
                  <Route path={'/404'} exact component={ErrorPage} />

                  { /* Renders modal when route permits */ }
                  <Route path={'/cart/:cart_id/m/*'} exact component={Modal} />

                  { /* Renders cart when route permits */ }
                  <Route path={'/cart/:cart_id'} exact component={CartContainer} />

                  { /* Renders cart choice if theres no store set */}
                  <Route path={'/newcart'} exact component={CartStoresContainer} />
                </div>
              )
            }
          </div>
          { showSidenav && ( sidenav || !isMobile ) ? <Sidenav cart_id={cart_id} replace={replace} logout={logout} leader={leader} carts={carts} _toggleSidenav={_toggleSidenav} currentUser={currentUser} itemsLen={items.length} currentCart={currentCart} updateCart={updateCart} /> : null }
          {showFooter ? <Footer {...props} cart_id={cart_id} _togglePopup={_togglePopup} isMobile={isMobile}/> : null}
        </section>
    );
  }
}
