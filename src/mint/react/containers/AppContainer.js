import React from 'react';
import { connect } from 'react-redux';
import { App } from '../components';

import { changeKipFormView } from '../actions/kipForm';

import { fetchCart } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.match.params.cart_id,
  members: state.cart.members,
  leader: state.cart.leader,
  newAccount: state.session.newAccount,
  currentView: state.kipForm.currentView,
  accounts: state.session.user_accounts,
  addingItem: state.session.addingItem
})

const mapDispatchToProps = dispatch => ({
  fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
  changeKipFormView: (viewInt) => dispatch(changeKipFormView(viewInt))
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
