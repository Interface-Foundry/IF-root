
import { connect } from 'react-redux';
import { signIn } from '../actions/session';
import { SignInForm } from '../components';

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.cart_id
})

const mapDispatchToProps = dispatch => ({
  signIn: (cart_id, email) => dispatch(signIn(cart_id, email)) 
})

export default connect(mapStateToProps, mapDispatchToProps)(SignInForm);
