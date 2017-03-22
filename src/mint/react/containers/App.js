import React, { PropTypes } from 'react';
import InputContainer from './InputContainer';
import CartContainer from './CartContainer';
import { connect } from 'react-redux';
import '../styles/App.scss';

const App = ({ cart_id, loggedIn, newAccount, accounts }) => (
  <div>
    <h2>Cart ID #{cart_id}</h2>
    <div>Accounts: <ul>{accounts.map((account, i) => <li key={i}>{account.email_address}</li>)}</ul></div>
 <hr/>
    {loggedIn
      ? <CartContainer cart_id={cart_id}/>
      : ((newAccount || newAccount === undefined)
        ? <InputContainer cart_id={cart_id} />
        : <div>Looks like you've been here before. We just sent you an email, use that to log in! </div> ) }
    <hr/>
  </div>
);

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: ownProps.match.params.cart_id,
    loggedIn: state.session.user_accounts.length > 0,
    newAccount: state.session.newAccount,
    accounts: state.session.user_accounts
  }
};

export default connect(mapStateToProps)(App);
