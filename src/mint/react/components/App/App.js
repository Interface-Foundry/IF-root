// mint/react/components/App/App.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import ReactDOM from 'react-dom'

import { CartContainer } from '../../containers';
import { Overlay, Modal } from '..';
import Header from './Header';
import Sidenav from './Sidenav';
import Footer from './Footer';

import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

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
    status: null,
    toast: null,
    showedToast: false,
    isMobile: false
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
    const { props: { fetchCart, fetchAllCarts, cart_id, status, toast } } = this;
    if (cart_id) fetchCart(cart_id);
    fetchAllCarts();
    if (toast && status)::this._showToast(status, toast);
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this)
    if (window.innerWidth < 900)
      this.setState({ isMobile: true })
  }

  componentWillReceiveProps(nextProps) {
    const {
      _logPageView,
      props: { fetchCart, fetchAllCarts, cart_id, session_id, status, toast, location: { pathname } }
    } = this;
    const { cart_id: nextCart_id, session_id: nextSessionId, status: newStatus, toast: newToast } = nextProps;

    if (!session_id && nextSessionId) {
      ReactGA.initialize('UA-51752546-10', {
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
    if ((newToast && newStatus) && (toast !== newToast || status !== newStatus))::this._showToast(newStatus, newToast);
    if (newToast && newToast.includes('Cart Updated')) fetchAllCarts();
  }

  _showToast(status, toast) {
    const { history: { replace }, cart_id } = this.props;
    setTimeout(() => this.setState({ status, toast, showedToast: false }), 1);
    setTimeout(() => {
      this.setState({ toast: null, status: null, showedToast: true });
      replace(`/cart/${cart_id}/`);
    }, 3000);
  }

  render() {
    const {
      _toggleSidenav,
      props,
      props: { cart_id, currentCart, updateCart, newAccount, leader, carts, match, currentUser, location, logout, items },
      state: { sidenav, toast, status, showedToast, isMobile }
    } = this;
    const showFooter = !location.pathname.includes('/m/edit');
    const showSidenav = !location.pathname.includes('/m/signin');

    if (newAccount === false) {
      return <Overlay/>;
    }
    return (
      <section className='app'>
        {
           <CSSTransitionGroup
              transitionName='toastTransition'
              transitionEnterTimeout={0}
              transitionLeaveTimeout={0}>
              {
                toast && !showedToast
                ? <div className={`${status} toast`} key={toast}>
                    {toast}
                  </div>
                : null
            }
            </CSSTransitionGroup> 
        }
        <Header {...props}  _toggleSidenav={ _toggleSidenav}  isMobile={isMobile}/>
        <div className={`app__view ${showFooter ? '' : 'large'}`}>
          { /* Renders modal when route permits */ }
          <Route path={`${match.url}/m/`} component={Modal} />

          { /* Renders cart when route permits */ }
          <Route path={`${match.url}`} exact component={CartContainer} />
        </div>
        { showSidenav && ( sidenav || !isMobile ) ? <Sidenav cart_id={cart_id} logout={logout} leader={leader} carts={carts} _toggleSidenav={_toggleSidenav} currentUser={currentUser} itemsLen={items.length} currentCart={currentCart} updateCart={updateCart} /> : null }
        {showFooter ? <Footer {...props} cart_id={cart_id} isMobile={isMobile}/> : null}
      </section>
    );
  }
}
