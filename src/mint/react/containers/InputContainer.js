import React, { Component } from 'react';
import { connect } from 'react-redux';
import { session } from '../actions';
import SignInForm from '../components/SignInForm';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux'

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
  render() {
    const { dispatch } = this.props;
    let boundActionCreators = bindActionCreators(session, dispatch);
    return <SignInForm cart_id={this.props.cart_id} {...boundActionCreators} />;
  }
}

export default connect(mapStateToProps)(InputContainer);
