import { connect } from 'react-redux';
import Hero from '../components/Hero';

import {
  scrollToPosition
} from '../actions';

const mapStateToProps = (state, props) => ({
  animate: !state.app.fixed,
  heroTemplate: state.siteState.hero,
  src: sessionStorage.src || state.siteState.src
});

const mapDispatchToProps = dispatch => ({
  scrollToPosition: (pos) => dispatch(scrollToPosition(pos))
});

export default connect(mapStateToProps, mapDispatchToProps)(Hero);
