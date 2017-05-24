import { connect } from 'react-redux';
import Landing from '../components/Landing';

import { 	
	get,
	registerHeight 
} from '../actions';

const mapStateToProps = (state, props) => ({
  	fixed: state.app.fixed,
	name: state.auth.user_account ? state.auth.user_account.name : '',
  	animationState: state.app.animationState
})

const mapDispatchToProps = dispatch => ({
    registerHeight: (heightFromTop, containerHeight) => dispatch(registerHeight(heightFromTop, containerHeight)),
    updateCarts: () => dispatch(get('/api/carts', 'CARTS'))
})

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
