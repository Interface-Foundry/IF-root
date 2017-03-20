import React, { PropTypes } from 'react';
import InputContainer from './InputContainer';
import CartContainer from './CartContainer';
import { connect } from 'react-redux';
import '../styles/App.scss';

const App = ({ cart_id, loggedIn, hasAccount, state }) => (
  <div>
    <h2>Cart ID #{cart_id}</h2>
    <hr/>
    {loggedIn
      ? <CartContainer cart_id={cart_id}/>
      : (hasAccount 
        ? <div>We just sent you an email, use that to log in! </div> 
        : <InputContainer cart_id={cart_id} />) }
    <hr/>
  </div>
);

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.match.params.cart_id,
  loggedIn: state.session.user_accounts.length > 0,
  hasAccount: state.session.has_account,
  state: state
});

export default connect(mapStateToProps)(App);
