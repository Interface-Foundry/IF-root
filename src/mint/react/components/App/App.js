// mint/react/components/App/App.js

// NOTES: Try to keep any or all state/prop changes out of here otherwise it will bleed down all the way to the smallest component. 
// If change needed here please add the addition shouldComponentUpdate

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Route } from 'react-router';

import { HeaderContainer, TabsContainer, ViewContainer, LoginScreenContainer, SidenavContainer, StoresContainer } from '../../containers';
import { ErrorPage, Modal, Toast, Loading } from '..';

//Analytics!
import ReactGA from 'react-ga';

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
    history: PropTypes.object
  }

  _handeKeyPress(e) {
    const { selectedItemId, navigateRightResults, navigateLeftResults } = this.props;
    if (selectedItemId) {
      switch (e.keyCode) {
      case 39:
        // right
    console.log('keypress')

        navigateRightResults()
        break;
      case 37:
        // left
    console.log('keypress')

        navigateLeftResults()
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
    const { fetchCart, fetchMetrics, match, cart } = this.props;
    if (nextProps.match.url.split('/')[2] !== match.url.split('/')[2]) {
      fetchCart(nextProps.match.url.split('/')[2]);
      fetchMetrics(nextProps.match.url.split('/')[2]);
    }
  }

  shouldComponentUpdate = (nextProps, nextState) =>
    nextProps.loading !== this.props.loading || nextProps.sidenav !== this.props.sidenav || nextProps.popup !== this.props.popup || nextProps.match.url !== this.props.match.url || nextProps.toast !== this.props.toast || nextProps.selectedItemId !== this.props.selectedItemId

  render() {
    const { sidenav, popup, togglePopup, match, toast, loading, status, history: { replace } } = this.props;
    return (
      <section className='app' onKeyDown={::this._handeKeyPress}>
        { popup ? <LoginScreenContainer _toggleLoginScreen={togglePopup} /> : null }
        <Route path={'/'} component={HeaderContainer} />
        <Route path={'/cart/:cart_id'} exact component={TabsContainer} />
        { loading ? <Loading /> : null }
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
