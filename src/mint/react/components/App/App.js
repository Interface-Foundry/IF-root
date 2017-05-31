// mint/react/components/App/App.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import { CartContainer, CartStoresContainer, LoginScreenContainer } from '../../containers';
import { Modal, Toast, ErrorPage } from '..';

import Header from './Header';
import { Sidenav } from '../../../react-common/components';
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
    user_account: PropTypes.object,
    match: PropTypes.object.isRequired,
    fetchCart: PropTypes.func.isRequired,
    updateCart: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    session_id: PropTypes.string,
    currentCart: PropTypes.object,
    logout: PropTypes.func,
    items: PropTypes.array,
    toast: PropTypes.string,
    status: PropTypes.string,
    history: PropTypes.object,
    clearItem: PropTypes.func,
    archivedCarts: PropTypes.arrayOf(PropTypes.object)
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

  componentDidMount() {
    if (window.innerWidth < 900)
      this.setState({ isMobile: true });
  }

  componentWillReceiveProps(nextProps) {
    const {
      _logPageView,
      props: {
        fetchCart,
        cart_id,
        session_id,
        user_account: { id },
        location: { pathname },
        history: { replace }
      }
    } = this;
    const { cart_id: nextCart_id, session_id: nextSessionId, user_account: { id: nextId } } = nextProps;
    if (!session_id && nextSessionId && process.env.GA) {
      ReactGA.initialize('UA-51752546-10', {
        gaOptions: {
          userId: nextSessionId
        }
      });

      _logPageView(pathname, nextSessionId); //log initial load
    }
    if (!pathname.includes('/newcart')
      && !pathname.includes('/feedback')
      && !pathname.includes('/archive')
      && !pathname.includes('/settings')
      && !pathname.includes('/404')
      && ((nextCart_id && cart_id !== nextCart_id) || (nextId && nextId !== id))) {
      fetchCart(nextCart_id)
        .then(cart => !cart ? replace('/404') : null);
    }
  }

  _handeKeyPress(e) {
    const { cart_id, history: { replace } } = this.props;
    if (e.keyCode === 27) replace(`/cart/${cart_id}`);
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
        leader,
        carts,
        user_account,
        location,
        logout,
        clearItem,
        items,
        archivedCarts,
        history: { replace }
      },
      state: { sidenav, isMobile, popup }
    } = this;
    const showFooter = !location.pathname.includes('/m/edit') || location.pathname.includes('/404') || location.pathname.includes('newcart');
    return (
      <section className='app' onKeyDown={::this._handeKeyPress}>
        <Toast toast={toast} status={status} loc={location} replace={replace}/>
        <Header {...props}  _toggleSidenav={ _toggleSidenav} _togglePopup={_togglePopup} isMobile={isMobile}/>
        {popup ? <LoginScreenContainer _toggleLoginScreen={_togglePopup}/> : null}
        <div className={`app__view ${showFooter ? '' : 'large'}`}>
          <div>
            {/* Render Error Page */}
            <Route path={'/404'} exact component={ErrorPage} />

            { /* Renders modal when route permits */ }
            <Route path={'/cart/:cart_id/m/*'} exact component={Modal} />

            { /* Renders cart when route permits */ }
            <Route path={'/cart/:cart_id'} exact component={CartContainer} />
            <Route path={'/cart/:cart_id/address'} exact component={CartContainer} />

            { /* Renders cart choice if theres no store set */}
            <Route path={'/newcart'} exact component={(props) => <CartStoresContainer {...props} _toggleLoginScreen={_togglePopup}/>} />
          </div>
        </div>
        { 
          sidenav || !isMobile 
          ? <Sidenav cart_id={cart_id} replace={replace} logout={logout} leader={leader} carts={carts} _toggleSidenav={_toggleSidenav} user_account={user_account} itemsLen={items.length} currentCart={currentCart} updateCart={updateCart} archivedCarts={archivedCarts} /> 
          : null
        }
        {
          showFooter 
          ? <Footer {...props} clearItem={clearItem} cart_id={cart_id} _togglePopup={_togglePopup} isMobile={isMobile}/> 
          : null
        }
      </section>
    );
  }
}
