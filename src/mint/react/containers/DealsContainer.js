import { connect } from 'react-redux';
import { Deals } from '../components';

import { fetchItem, selectItem } from '../actions/item';

// N.B = Look into routing, Look into the correct api endpoint.
const mapStateToProps = (state, ownProps) => ({
	cart_id: state.cart.cart_id,
	isDropDown: ownProps.isDropDown,
	user_accounts: state.session.user_accounts,
    deals: state.deals.deals
})

const mapDispatchToProps = dispatch => ({
	fetchItem: (cart_id, asin, replace, user_accounts) => dispatch(fetchItem(cart_id, asin)).then((returnItem) => { 
			const { item } = returnItem,
				newItem = {...item, added_by: user_accounts[0].id};   

			dispatch(selectItem(newItem));

			replace(`/cart/${cart_id}/m/item/${item.id}`);
		})
});

export default connect(mapStateToProps, mapDispatchToProps)(Deals);
