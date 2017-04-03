import React from 'react';
import { connect } from 'react-redux';

import { addingItem } from '../actions/cart'; 
import { changeModalComponent } from '../actions/modal';
import { AddAmazonItem } from '../components';

const mapStateToProps = (state, ownProps) => ({
  user_accounts: state.session.user_accounts
});

const mapDispatchToProps = dispatch => ({
	addingItem: (bool) => dispatch(addingItem(bool)),
	changeModalComponent: (componentName) => dispatch(changeModalComponent(componentName))
});

export default connect(mapStateToProps, mapDispatchToProps)(AddAmazonItem);
