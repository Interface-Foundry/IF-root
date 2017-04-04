import { connect } from 'react-redux';
import { reset } from 'redux-form'

import { AmazonForm } from '../components';

import { addItem, addingItem } from '../actions/cart';

import { reduxForm } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
	cart_id: state.cart.cart_id
});

const mapDispatchToProps = dispatch => ({
	onSubmit: (values, e, state) => dispatch(addItem(state.cart_id, values.url)).then(() => { 
			const { history: { replace }, cart_id } = state;    
			dispatch(reset('AddItem'));
			dispatch(addingItem(false));
			replace(`/cart/${cart_id}`);
		})
});

const validate = (values, state) => {
	const errors = {};

	if (!values.url) {
		errors.url = 'Please enter a amazon URL';
	}

	return errors;
};

const AmazonFormContainer = reduxForm({
	form: 'AddItem',
	validate
})(AmazonForm);

export default connect(mapStateToProps, mapDispatchToProps)(AmazonFormContainer);
