import { connect } from 'react-redux';
import Compare from '../components/Compare';

const mapStateToProps = (state, props) => ({
  compareTemplate: state.siteState.compare,
  src: sessionStorage.src || state.siteState.src
});

export default connect(mapStateToProps)(Compare);
