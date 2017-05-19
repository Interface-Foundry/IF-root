import { connect } from 'react-redux';
import Landing from '../components/Landing';

import { 	
	registerHeight 
} from '../actions';

const mapStateToProps = (state, props) => ({
  	fixed: state.app.fixed,
  	animationState: state.app.animationState
})

const mapDispatchToProps = dispatch => ({
    registerHeight: (heightFromTop, containerHeight) => dispatch(registerHeight(heightFromTop, containerHeight)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Landing);

