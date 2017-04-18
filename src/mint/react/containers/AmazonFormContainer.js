import { connect } from 'react-redux';
import { reset, reduxForm } from 'redux-form';

import { AmazonForm } from '../components';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  item: state.item
});

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => {
    const { history: { replace }, cart_id } = state;
    dispatch(reset('AddItem'));
    replace(`/cart/${cart_id}/m/item/0/${encodeURIComponent(values.url)}`);
  }
});

const validate = (values, state) => {
  const errors = {};
  if (!values.url) {
    errors.url = 'Don\'t forget to add something!';
  }
  return errors;
};

const AmazonFormContainer = reduxForm({
  form: 'AddItem',
  validate
})(AmazonForm);

export default connect(mapStateToProps, mapDispatchToProps)(AmazonFormContainer);
