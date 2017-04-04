import { connect } from 'react-redux';
import { reset } from 'redux-form'

import { AmazonForm } from '../components';

import { addItem, addingItem } from '../actions/cart';
import { fetchItem, selectItem } from '../actions/item';

import { reduxForm } from 'redux-form';

// N.B = Look into routing, Look into the correct api endpoint.
const mapStateToProps = (state, ownProps) => ({
	cart_id: state.cart.cart_id,
	user_accounts: state.session.user_accounts,
	item: state.item,
});

const mapDispatchToProps = dispatch => ({
	onSubmit: (values, e, state) => dispatch(fetchItem(state.cart_id, values.url)).then((returnItem) => { 
			const { history: { replace }, cart_id, user_accounts } = state,
				{ url } = values,
				{ item } = returnItem,
				newItem = {...item, added_by: user_accounts[0].id, original_link: url};   

			dispatch(reset('AddItem'));
			dispatch(addingItem(false));
			dispatch(selectItem(newItem));

			replace(`/cart/${cart_id}/m/item/${item.id}`);
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
