import { connect } from 'react-redux';
import { AmazonForm } from '../components';

import { addItem } from '../actions/cart';

import { reduxForm } from 'redux-form';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id
});

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => dispatch(addItem(state.cart_id, values.url))
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
  validate,
})(AmazonForm);

export default connect(mapStateToProps, mapDispatchToProps)(AmazonFormContainer);
