// mint/react/components/App/App.js

// NOTES: Try to keep any or all state/prop changes out of here otherwise it will bleed down all the way to the smallest component. 
// If change needed here please add the addition shouldComponentUpdate

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';
import ReactGA from 'react-ga';

import { HeaderContainer, TabsContainer, ViewContainer, LoginScreenContainer, SidenavContainer, StoresContainer } from '../../containers';
import { ErrorPage, Modal, Toast, Loading } from '..';

export default class App extends Component {

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
    selectedItemId: PropTypes.string
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
        <div className={`app__view ${sidenav ? 'squeeze' : ''}`}>
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
