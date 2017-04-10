import { connect } from 'react-redux';
import { reset, reduxForm } from 'redux-form';

import { AmazonForm } from '../components';

// N.B = Look into routing, Look into the correct api endpoint.
const mapStateToProps = (state, ownProps) => ({
  cart_id: state.cart.cart_id,
  item: state.item
});

// remove
const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => {
    const { history: { replace }, cart_id } = state;
    dispatch(reset('AddItem'));
    replace(`/cart/${cart_id}/m/item/${encodeURIComponent(values.url)}`);
  }
});

const validate = (values, state) => {
  const errors = {};
  if (!values.url) {
    errors.url = '';
  }
  return errors;
};

const AmazonFormContainer = reduxForm({
  form: 'AddItem',
  validate
})(AmazonForm);

export default connect(mapStateToProps, mapDispatchToProps)(AmazonFormContainer);
