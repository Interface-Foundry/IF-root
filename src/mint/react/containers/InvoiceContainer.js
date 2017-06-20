// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Invoice } from '../components';

import { 
  selectTab
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    cart: state.cart.present
  };
};

// Just an example for mapping functions to the component. 
// What this does it connect the functions to redux, so that the results of those functions get passed to our redux store. 
const mapDispatchToProps = dispatch => ({
  selectTab: (tab) => dispatch(selectTab(tab))
});

export default connect(mapStateToProps, mapDispatchToProps)(Invoice);




