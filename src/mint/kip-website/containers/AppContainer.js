import { connect } from 'react-redux';
import App from '../components/App';

import {
  registerHeight,
  handleScroll,
} from '../actions';

const mapStateToProps = (state, props) => ({
  sidenav: state.app.sidenav,
  modal: state.app.modal,
  fixed: state.app.fixed,
  animationState: state.app.animationState,
  animationOffset: state.app.animationOffset,
  containerHeight: state.app.containerHeight,
  scrollTo: state.app.scrollTo
})

const mapDispatchToProps = dispatch => ({
  handleScroll: (scrollTop, fixed, animationState, animationOffset, containerHeight) => dispatch(handleScroll(scrollTop, fixed, animationState, animationOffset, containerHeight)),
  registerHeight: (heightFromTop, containerHeight) => dispatch(registerHeight(heightFromTop, containerHeight))
})

export default connect(mapStateToProps, mapDispatchToProps)(App);