import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { signUp } from '../actions'
import { getUserInfo } from '../reducers'
import SignUpForm from '../components/SignUpForm'

const InputContainer = ({ cart_id, signUp }) => (
  <SignUpForm cart_id={cart_id} onSubmit={signUp} />
);

const mapStateToProps = (state, ownProps) => ({
  user: getUserInfo(state),
  cart_id: ownProps.cart_id
});

export default connect(mapStateToProps, { signUp })(InputContainer);
