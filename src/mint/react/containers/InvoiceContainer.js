// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Invoice } from '../components';

import { 
  selectAccordion
} from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    cart: state.cart.present,
    selectedAccordion: state.app.selectedAccordion
  };
};

// Just an example for mapping functions to the component. 
// What this does it connect the functions to redux, so that the results of those functions get passed to our redux store. 
const mapDispatchToProps = dispatch => ({
  selectAccordion: (accordion) => dispatch(selectAccordion(accordion))
});

export default connect(mapStateToProps, mapDispatchToProps)(Invoice);




