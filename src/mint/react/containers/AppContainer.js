import React from 'react';
import { connect } from 'react-redux';
import { App } from '../components';

import { changeModalComponent } from '../actions/modal';
import { fetchCart } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.match.params.cart_id,
  members: state.cart.members,
  leader: state.cart.leader,
  newAccount: state.session.newAccount,
  accounts: state.session.user_accounts,
  modal: state.modal.component,
});

const mapDispatchToProps = dispatch => ({
  fetchCart: (cart_id) => dispatch(fetchCart(cart_id)),
  changeModalComponent: (componentName) => dispatch(changeModalComponent(componentName))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
