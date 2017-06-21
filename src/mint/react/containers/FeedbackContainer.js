// react/containers/EditCartContainer.js

import { connect } from 'react-redux';
import { reset, reduxForm } from 'redux-form';
import { replace } from 'react-router-redux';
import { Feedback } from '../components';
import ReactGA from 'react-ga';
import { postFeedback } from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: state.cart.present.id
  };
};

const mapDispatchToProps = dispatch => ({
  // We need to edit the cart here
  onSubmit: (values, e, state) => {
    dispatch(postFeedback(values))
      .then(() => {
        ReactGA.event({
          category: 'Feedback',
          action: 'Feedback Sent'
        });
        dispatch(reset('Feedback'));
        replace(`/cart/${state.cart_id}?toast=Feedback sent, thanks! 😎&status=success`);
      });
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
