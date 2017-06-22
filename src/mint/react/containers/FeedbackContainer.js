// react/containers/EditCartContainer.js

import { connect } from 'react-redux';
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
  postFeedback: (values, cart_id) => {
    dispatch(postFeedback(values))
      .then(() => {
        ReactGA.event({
          category: 'Feedback',
          action: 'Feedback Sent'
        });
        dispatch(replace(`/cart/${cart_id}?toast=Feedback sent, thanks! 😎&status=success`));
      });
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
