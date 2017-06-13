import { connect } from 'react-redux';
import Header from '../components/Header';

import {
  scrollToPosition
} from '../actions';

const mapStateToProps = (state, props) => ({
  title: props.title,
  subtext: props.subtext,
  color: props.color,
  user_account: state.auth.user_account,
  fixed: state.app.fixed,
  scrollTo: state.app.scrollTo,
  headerTemplate: state.siteState.header,
  src: sessionStorage.src
})

const mapDispatchToProps = dispatch => ({
  scrollToPosition: (pos) => dispatch(scrollToPosition(pos)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Header);
