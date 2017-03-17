import React, { PropTypes } from 'react';
import InputContainer from './InputContainer';
import CartContainer from './CartContainer';
import { connect } from 'react-redux';
import '../styles/App.scss';

const App = ({ cart_id, loggedIn, state }) => (
  <div>
    <h2>Cart ID #{cart_id}</h2>
    <hr/>
    {loggedIn
      ? <CartContainer cart_id={cart_id}/>
      : <InputContainer cart_id={cart_id} /> }
    <hr/>
  </div>
);

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.match.params.cart_id,
  loggedIn: state.session.user_accounts.length > 0,
  state: state
});

export default connect(mapStateToProps)(App);
