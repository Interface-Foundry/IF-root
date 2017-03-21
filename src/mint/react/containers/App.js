import React, { PropTypes } from 'react';
import InputContainer from './InputContainer';
import CartContainer from './CartContainer';
import { connect } from 'react-redux';
import '../styles/App.scss';

const App = ({ cart_id, loggedIn, newAccount, state }) => (
  <div>
    <h2>Cart ID #{cart_id}</h2>
    <hr/>
    {loggedIn
      ? <CartContainer cart_id={cart_id}/>
      : (newAccount 
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
    state: state
  }
};

export default connect(mapStateToProps)(App);
