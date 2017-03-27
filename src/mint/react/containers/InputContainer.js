import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { session } from '../actions';
import { SignInForm } from '../components';
import { bindActionCreators } from 'redux';

class InputContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired
  }
  render() {
    const { dispatch, cart_id } = this.props;
    let boundActionCreators = bindActionCreators(session, dispatch);
    return <SignInForm cart_id={cart_id} {...boundActionCreators} />;
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: ownProps.cart_id
  };
};

export default connect(mapStateToProps)(InputContainer);
