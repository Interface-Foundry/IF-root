import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { session } from '../actions'
import SignUpForm from '../components/SignUpForm'
const signUp = session.signUp;

const InputContainer = ({ cart_id, signUp }) => (
  <SignUpForm cart_id={cart_id} onSubmit={signUp} />
);

const mapStateToProps = ({session}, ownProps) => ({
  session: session,
  cart_id: ownProps.cart_id
});

export default connect(mapStateToProps, { signUp })(InputContainer);
