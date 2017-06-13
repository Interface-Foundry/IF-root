import { connect } from 'react-redux';
import Help from '../components/Help';

const mapStateToProps = (state, props) => ({
  helpTemplate: state.siteState.help,
  src: sessionStorage.src || state.siteState.src
});

export default connect(mapStateToProps)(Help);
