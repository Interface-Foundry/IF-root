import { connect } from 'react-redux';
import Compare from '../components/Compare';

const mapStateToProps = (state, props) => ({
  compareTemplate: state.siteState.compare
});

export default connect(mapStateToProps)(Compare);
