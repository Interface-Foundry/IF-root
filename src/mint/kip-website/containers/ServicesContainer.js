import { connect } from 'react-redux';
import Services from '../components/Services';

const mapStateToProps = (state, props) => ({
  servicesTemplate: state.siteState.services
});

export default connect(mapStateToProps)(Services);