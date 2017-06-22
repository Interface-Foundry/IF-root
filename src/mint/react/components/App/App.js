// mint/react/components/App/App.js

// NOTES: Try to keep any or all state/prop changes out of here otherwise it will bleed down all the way to the smallest component. 
// If change needed here please add the addition shouldComponentUpdate

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import ReactGA from 'react-ga';

import { HeaderContainer, TabsContainer, ViewContainer, LoginScreenContainer, SidenavContainer, StoresContainer } from '../../containers';
import { ErrorPage, Modal, Toast, Loading } from '..';
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

  componentDidMount() {
    const { _handleScroll } = this;
    ReactDOM.findDOMNode(this.scroll)
      .addEventListener('scroll', _handleScroll);
  }

  componentWillUnmount() {
    const { _handleScroll } = this;
    ReactDOM.findDOMNode(this.scroll)
      .removeEventListener('scroll', _handleScroll);
  }

  _handeKeyPress(e) {
    const { selectedItemId, navigateRightResults, navigateLeftResults } = this.props;
    if (selectedItemId) {
      switch (e.keyCode) {
      case 39:
        navigateRightResults();
        break;
      case 37:
        navigateLeftResults();
        break;
      }
    }
  }

  _logPageView(path, userId) {
    ReactGA.set({ userId });
    ReactGA.event({
      category: 'User',
      action: 'Initial Load'
    });
  }

  _handleScroll(e) {
    const { location: { search }, query, cart, page, getMoreSearchResults } = this.props;

    // lazy loading for search. Could also hook up the scroll to top on every new search query.
    if(search) {
      const scrollTop = ReactDOM.findDOMNode(this.scroll).scrollTop,
        containerHeight = ReactDOM.findDOMNode(this.scroll).scrollHeight,
        windowHeight = ReactDOM.findDOMNode(this.scroll).clientHeight;

      // animate scroll, needs height of the container, and its distance from the top
      if(checkPageScroll(scrollTop, containerHeight, windowHeight)) {
        getMoreSearchResults(query, cart.store, cart.store_locale, page + 1)
      };
    }
  }

  componentWillReceiveProps(nextProps) {
    const { fetchCart, fetchMetrics, match } = this.props;
    if (nextProps.match.url.split('/')[2] !== match.url.split('/')[2]) {
      fetchCart(nextProps.match.url.split('/')[2]);
      fetchMetrics(nextProps.match.url.split('/')[2]);
    }
  }

  shouldComponentUpdate = (nextProps, nextState) =>
    nextProps.loading !== this.props.loading || nextProps.sidenav !== this.props.sidenav || nextProps.popup !== this.props.popup || nextProps.match.url !== this.props.match.url || nextProps.history.location.search !== this.props.history.location.search || nextProps.toast !== this.props.toast || nextProps.selectedItemId !== this.props.selectedItemId

  render() {
    const { sidenav, popup, togglePopup, match, toast, status, loading, history: { replace } } = this.props;
    return (
      <section className='app' onKeyDown={::this._handeKeyPress}>
        { popup ? <LoginScreenContainer _toggleLoginScreen={togglePopup} /> : null }
        { loading ? <Loading/> : null}
        <Route path={'/'} component={HeaderContainer} />
        <Route path={'/cart/:cart_id'} exact component={TabsContainer} />
        <div className={`app__view ${sidenav ? 'squeeze' : ''}`} ref={(scroll) => this.scroll = scroll}>
          <Toast toast={toast} status={status} loc={location} replace={replace}/>
          <Route path={'/cart/:cart_id/m/*'} component={Modal} />
          <Route path={'/newcart'} exact component={StoresContainer} />
          <Route path={'/cart/:cart_id'} exact component={ViewContainer} />
          <Route path={'/404'} exact component={ErrorPage} />
        </div>
        { sidenav ? <SidenavContainer large={match.url.includes('/m/') || match.url.includes('/newcart')}/> : null }  
      </section>
    );
  }
}
