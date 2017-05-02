// react/containers/EditCartContainer.js

import { connect } from 'react-redux';
import { reset, reduxForm } from 'redux-form';

import { Feedback } from '../components';

import { postFeedback } from '../actions/session';

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: state.currentCart.cart_id
  };
};

const mapDispatchToProps = dispatch => ({
  // We need to edit the cart here
  onSubmit: (values, e, state) => {
    dispatch(postFeedback(values))
    .then(() => {
      const { history: { replace }, cart_id } = state;
      dispatch(reset('Feedback'));
      replace(`/cart/${cart_id}/`);
    })
  }
});

const validate = (values, state) => {
  const errors = {};

  return errors;
};

const FeedbackContainer = reduxForm({
  form: 'Feedback',
  validate
})(Feedback);

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackContainer);