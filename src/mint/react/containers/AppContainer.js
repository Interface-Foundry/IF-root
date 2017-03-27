import React from 'react';
import { connect } from 'react-redux';
import { App } from '../components';

const mapStateToProps = (state, ownProps) => ({
    cart_id: ownProps.match.params.cart_id,
    newAccount: state.session.newAccount,
    accounts: state.session.user_accounts
})

export default connect(mapStateToProps)(App);
