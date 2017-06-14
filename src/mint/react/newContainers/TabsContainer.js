// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Tabs } from '../newComponents';

import {
  selectTab
} from '../newActions';

const mapStateToProps = (state, ownProps) => {
  return {
    tab: state.app.viewTab,
    cart: state.cart
  };
};

const mapDispatchToProps = dispatch => ({
  selectTab: (tab) => dispatch(selectTab(tab))
});

export default connect(mapStateToProps, mapDispatchToProps)(Tabs);
