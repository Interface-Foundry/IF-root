import { connect } from 'react-redux';
import { SignInForm } from '../components';

import { signIn } from '../actions/session';

import { reduxForm, reset } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
	cart_id: state.cart.cart_id,
})

const mapDispatchToProps = dispatch => ({
	onSubmit: (values, e, state) => {
		const { email } = values;
		const { cart_id } = state;

		dispatch(signIn(cart_id, email))
		dispatch(reset('SignInForm'))
	}
})

const SignInFormContainer = reduxForm({
    form: 'SignInForm'
})(SignInForm)

export default connect(mapStateToProps, mapDispatchToProps)(SignInFormContainer)