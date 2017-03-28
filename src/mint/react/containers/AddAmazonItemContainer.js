import { connect } from 'react-redux';
import { AddAmazonItem } from '../components';

import { addItem } from '../actions/cart';

import { reduxForm, reset } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id
})

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => {
    const { url } = values;
    const { cart_id } = state;

    dispatch(addItem(cart_id, url))
    dispatch(reset('AddAmazonItem'))
  }
})

const AddAmazonItemContainer = reduxForm({
  form: 'AddAmazonItem'
})(AddAmazonItem)

export default connect(mapStateToProps, mapDispatchToProps)(AddAmazonItemContainer)
