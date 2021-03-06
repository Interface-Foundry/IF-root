import { connect } from 'react-redux';
import Footer from '../components/Footer';

const mapStateToProps = (state, props) => ({
  footerTemplate: state.siteState.footer,
  src: sessionStorage.src || state.siteState.src
});

export default connect(mapStateToProps)(Footer);
