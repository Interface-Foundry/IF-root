import React from 'react';
import { connect } from 'react-redux';

import { changeKipFormView } from '../actions/kipForm';
import { toggleAddingToCart } from '../actions/session';
import { AddAmazonItem } from '../components';

const mapStateToProps = (state, ownProps) => ({
  user_accounts: state.session.user_accounts
});

const mapDispatchToProps = dispatch => ({
  changeKipFormView: (viewInt) => dispatch(changeKipFormView(viewInt)),
  toggleAddingToCart: () => dispatch(toggleAddingToCart())
});

export default connect(mapStateToProps, mapDispatchToProps)(AddAmazonItem);
