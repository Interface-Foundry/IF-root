// react/containers/AmazonFormContainer.js

import { connect } from 'react-redux';
import { reset, reduxForm } from 'redux-form';
import { AmazonForm } from '../components';
import { isUrl, addSearchHistory } from '../utils';
import { previewAmazonItem } from '../actions/item';
import { push } from 'react-router-redux';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  item: state.item
});

const mapDispatchToProps = dispatch => ({
  onSubmit: (values, e, state) => {
    ReactGA.event({
      category: 'Search',
      action: `Searched for ${values.url}`
    });
    const { cart_id } = state;
    if (!isUrl(values.url)) addSearchHistory(values.url);
    else dispatch(push(`/cart/${cart_id}/m/item/0/${encodeURIComponent(values.url)}`));
    
    return dispatch(previewAmazonItem(encodeURIComponent(values.url)))
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
