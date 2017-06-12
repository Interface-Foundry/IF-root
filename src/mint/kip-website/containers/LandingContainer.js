import { connect } from 'react-redux';
import Landing from '../components/Landing';

import {
  get,
  registerHeight,
  scrollToPosition
} from '../actions';

const mapStateToProps = (state, props) => ({
  fixed: state.app.fixed,
  name: state.auth.user_account ? state.auth.user_account.name : '',
  animationState: state.app.animationState
});

const mapDispatchToProps = dispatch => ({
  registerHeight: (heightFromTop, containerHeight) => dispatch(registerHeight(heightFromTop, containerHeight)),
  updateCarts: () => dispatch(get('/api/carts', 'CARTS')),
  scrollToPosition: (pos) => dispatch(scrollToPosition(pos))
})

export default connect(mapStateToProps, mapDispatchToProps)(Landing);