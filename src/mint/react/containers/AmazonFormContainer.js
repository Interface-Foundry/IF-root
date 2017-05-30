// react/containers/AmazonFormContainer.js

import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { AmazonForm } from '../components';
import { isUrl, addSearchHistory, getLastSearch } from '../utils';
import { search, clearItem } from '../actions/item';
import { push } from 'react-router-redux';
import ReactGA from 'react-ga';

const getState = (dispatch) => new Promise((resolve) => {
  dispatch((dispatch, getState) => { resolve(getState()); });
});

const mapStateToProps = (state, ownProps) => ({
  cart_id: state.currentCart.cart_id,
  storeName: state.currentCart.store,
  item: state.item,
  cardType: state.cards.type,
  initialValues: { url: state.cards.type ? (state.cards.type.includes('search') ? getLastSearch() : '') : '' }
});

const mapDispatchToProps = (dispatch) => ({
  onSubmit: async(values, e, state) => {
    ReactGA.event({
      category: 'Search',
      action: values.url
    });
    const { cart_id } = state;
    dispatch(clearItem());

    // Check if URL. If search query add to SearchHistory and run search. Otherwise encode url and search from item.
    if (!isUrl(values.url)) addSearchHistory(values.url);
    else dispatch(push(`/cart/${cart_id}/m/item/0/${encodeURIComponent(values.url)}`));
    const currentState = await getState(dispatch);
    return dispatch(search(encodeURIComponent(values.url), currentState.currentCart.store, currentState.currentCart.store_locale));
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