import { connect } from 'react-redux';
import CallToAction from '../components/CallToAction';

const mapStateToProps = (state, props) => ({
  ctaTemplate: state.siteState.callToAction,
  src: sessionStorage.src || state.siteState.src
});

export default connect(mapStateToProps)(CallToAction);
