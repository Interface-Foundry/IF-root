import React from 'react';
import { connect } from 'react-redux';
import Main from '../components/Main';
import '../styles/App.scss';

const App = (props) => (
  <Main {...props} />
);

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: ownProps.match.params.cart_id,
    newAccount: state.session.newAccount,
    accounts: state.session.user_accounts
  };
};

export default connect(mapStateToProps)(App);
