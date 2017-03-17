import React, { Component } from 'react';
import { connect } from 'react-redux';
import { session } from '../actions';
import SignInForm from '../components/SignInForm';
import { push } from 'react-router-redux';

// const mapStateToProps = ({ session }, ownProps) => ({
//   session: session,
//   cart_id: ownProps.cart_id
// });
const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: ownProps.cart_id
  };
};
class InputContainer extends Component {
  signIn(e, sessionInfo) {
  	console.log('singing in')
  	e.preventDefault();
    return session.signIn(sessionInfo);
  }
  render() {
    return <SignInForm cart_id={this.props.cart_id} onSubmit={this.signIn} />;
  }
}

export default connect(mapStateToProps)(InputContainer);
