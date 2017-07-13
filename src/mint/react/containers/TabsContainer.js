// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Tabs } from '../components';

import {
  selectTab,
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    tab: state.app.viewTab,
    search: state.search,
    cart: state.cart.present,
    showInvoice: state.payments.invoice && !process.env.NODE_ENV.includes('production'),
    invoice: state.payments.invoice
  };
};

const mapDispatchToProps = dispatch => ({
  selectTab: (tab) => dispatch(selectTab(tab))
});

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);
