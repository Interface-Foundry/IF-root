import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { signUp } from '../actions'
import SignUpForm from '../components/SignUpForm'

const InputContainer = ({ cart_id, signUp }) => (
  <SignUpForm
    cart_id={cart_id}
    onSubmit={() => signUp()} />
);

const mapStateToProps = (state) => ({
  cart_id: state.cart_id
});

export default connect(mapStateToProps)(InputContainer);
