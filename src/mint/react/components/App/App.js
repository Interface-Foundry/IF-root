// mint/react/components/App/App.js

// NOTES: Try to keep any or all state/prop changes out of here otherwise it will bleed down all the way to the smallest component. 
// If change needed here please add the addition shouldComponentUpdate

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import ReactGA from 'react-ga';

import { HeaderContainer, TabsContainer, ViewContainer, ButtonsContainer, LoginScreenContainer, SidenavContainer, StoresContainer } from '../../containers';
import { ErrorPage, Display, Toast, Loading } from '..';
import { checkPageScroll } from '../../utils';

export default class App extends Component {
  constructor(props) {
    super(props);
    this._handleScroll = ::this._handleScroll;
  }

  static propTypes = {
    fetchCart: PropTypes.func,
    match: PropTypes.object,
    popup: PropTypes.bool,
    sidenav: PropTypes.bool,
    loading: PropTypes.bool,
    query: PropTypes.string,
    cart: PropTypes.object,
    page: PropTypes.number,
    lazyLoading: PropTypes.bool,
    user: PropTypes.object,
    tab: PropTypes.string,
    location: PropTypes.object,
    togglePopup: PropTypes.func,
    fetchMetrics: PropTypes.func,
    navigateLeftResults: PropTypes.func,
    navigateRightResults: PropTypes.func,
    toast: PropTypes.string,
    status: PropTypes.string,
    history: PropTypes.object,
    selectedItemId: PropTypes.string,
    getMoreSearchResults: PropTypes.func
  }

  _logPageView(path, userId) {
    ReactGA.set({ userId });
    ReactGA.event({
      category: 'User',
      action: 'Initial Load'
    });
  }

  componentDidMount() {
    const { _handleScroll, _logPageView } = this;
    _logPageView();

    if (document.body.clientWidth > 600) this.scroll.addEventListener('scroll', _handleScroll);

  }

  componentWillUnmount() {
    const { _handleScroll } = this;

    if (document.body.clientWidth > 600) {
      this.scroll.removeEventListener('scroll', _handleScroll);
    }
  }

  _handeKeyPress({ keyCode }) {
    const { selectedItemId, navigateRightResults, navigateLeftResults } = this.props;
    if (selectedItemId) {
      switch (keyCode) {
      case 39:
        navigateRightResults();
        break;
      case 37:
        navigateLeftResults();
        break;
      }
    }
  }

  _handleScroll() {
    const { location: { search }, query, cart, page, getMoreSearchResults, lazyLoading } = this.props;

    // lazy loading for search. Could also hook up the scroll to top on every new search query.
    if (search) {
      const scrollTop = this.scroll.scrollTop,
        containerHeight = this.scroll.scrollHeight,
        windowHeight = this.scroll.clientHeight;

      // animate scroll, needs height of the container, and its distance from the top
      if (checkPageScroll(scrollTop, containerHeight, windowHeight) && !lazyLoading && query) {
        getMoreSearchResults(query, cart.store, cart.store_locale, page + 1);
      }
    }
  }

  componentWillReceiveProps({ user: { id: nextId }, location: { pathname: nextPathname } }) {
    const {
      _logPageView,
      props: { fetchCart, fetchMetrics, location: { pathname }, user: { id } }
    } = this;
    const cartId = pathname.match(/cart\/(\w*)\/?/),
      nextCartId = nextPathname.match(/cart\/(\w*)\/?/);
    if ((cartId && nextCartId && cartId[1] !== nextCartId[1]) || (!cartId && nextCartId)) {
      fetchCart(nextCartId[1]);
      fetchMetrics(nextCartId[1]);
    }

    if (!id && nextId && process.env.GA) {
      ReactGA.initialize('UA-51752546-10', {
        gaOptions: {
          userId: nextId
        }
      });

      _logPageView(pathname, nextId); //log initial load
    }
  }

  shouldComponentUpdate = (nextProps, nextState) => nextProps.tab !== this.props.tab || nextProps.loading !== this.props.loading || nextProps.sidenav !== this.props.sidenav || nextProps.popup !== this.props.popup || nextProps.location.pathname !== this.props.location.pathname || nextProps.location.search !== this.props.location.search || nextProps.toast !== this.props.toast || nextProps.selectedItemId !== this.props.selectedItemId

  render() {
    const { sidenav, popup, togglePopup, tab, match, toast, status, loading, history: { replace }, location: { pathname } } = this.props;
    return (
      <section className='app' onKeyDown={::this._handeKeyPress}>
        { popup ? <LoginScreenContainer _toggleLoginScreen={togglePopup} /> : null }
        { loading ? <Loading/> : null}
        <Route path={'/'} component={HeaderContainer} />
        <Route path={'/cart/:cart_id'} exact component={TabsContainer} />
        <div className={`app__view ${sidenav ? 'squeeze' : ''} ${pathname.includes('/m/') ? 'displayOpen' : ''}`} ref={(scroll) => this.scroll = scroll}>
          <Toast toast={toast} status={status} loc={location} replace={replace}/>
          <Route path={'/cart/:cart_id/m/*'} component={Display} />
          <Route path={'/newcart'} exact component={StoresContainer} />
          <Route path={'/cart/:cart_id'} exact component={ViewContainer} />
          <Route path={'/m/*'} exact component={Display} />
          <Route path={'/404'} exact component={ErrorPage} />


        </div>
        { sidenav ? <SidenavContainer large={match.url.includes('/m/') || match.url.includes('/newcart')}/> : null }  

        {
          // no jittery fix for mobile
        }
        <div className='noJudder'>
          { tab === 'cart' ? <ButtonsContainer /> : null }
          <Route path={'/cart/:cart_id'} exact component={TabsContainer} />
        </div>
        
      </section>
    );
  }
}
