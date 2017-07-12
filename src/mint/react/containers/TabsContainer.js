// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Tabs } from '../components';

import {
  selectTab,
  fetchInvoiceByCart
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    tab: state.app.viewTab,
    search: state.search,
    cart: state.cart.present,
    invoice: state.payments.invoice
  };
};

const mapDispatchToProps = dispatch => ({
  selectTab: (tab) => dispatch(selectTab(tab)),
  fetchInvoiceByCart: (id) => dispatch(fetchInvoiceByCart(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);
