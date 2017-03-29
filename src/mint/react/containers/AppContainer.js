import React from 'react';
import { connect } from 'react-redux';
import { App } from '../components';

import { loggedIn } from '../actions/session';

import { setCartId } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
    cart_id: ownProps.match.params.cart_id,
    newAccount: state.session.newAccount,
    onborded: state.session.onborded,
    accounts: state.session.user_accounts
})

const mapDispatchToProps = dispatch => ({
  setCartId: (cart_id) => dispatch(setCartId(cart_id)),
  loggedIn: (accounts) => dispatch(loggedIn(accounts))
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
