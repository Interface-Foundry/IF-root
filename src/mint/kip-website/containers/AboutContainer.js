import { connect } from 'react-redux';
import About from '../components/About';

const mapStateToProps = (state, props) => ({
  aboutTemplate: state.siteState.about,
  src: sessionStorage.src || state.siteState.src
});

export default connect(mapStateToProps)(About);
