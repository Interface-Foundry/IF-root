import { connect } from 'react-redux';
import About from '../components/About';

const mapStateToProps = (state, props) => ({
  aboutTemplate: state.siteState.about
});

export default connect(mapStateToProps)(About);