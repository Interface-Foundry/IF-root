import React from 'react';
import { connect } from 'react-redux';
import { App } from '../components';

import { loggedIn, registerEmail, onboardNewUser } from '../actions/session';

import { fetchCart } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.match.params.cart_id,
  newAccount: state.session.newAccount,
  loggedIn: state.session.loggedIn,
  onboarding: state.session.onboarding,
  registered: state.session.registered,
  accounts: state.session.user_accounts
})

const mapDispatchToProps = dispatch => ({
  fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
  loggedIn: (accounts) => dispatch(loggedIn(accounts)),
  onboardNewUser: () => dispatch(onboardNewUser()),
  registerEmail: () => dispatch(registerEmail())
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
