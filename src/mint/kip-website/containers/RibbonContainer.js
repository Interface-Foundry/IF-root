import { connect } from 'react-redux';
import Ribbon from '../components/Ribbon';

const mapStateToProps = (state, props) => ({
  	user_account: state.auth.user_account,
  	fixed: props.fixed
})

export default connect(mapStateToProps)(Ribbon);

