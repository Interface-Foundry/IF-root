import { connect } from 'react-redux';
import Blog from '../components/Blog';

import { get, scrollToPosition } from '../actions';

const mapStateToProps = (state, props) => ({
  posts: state.auth.posts,
  blogTemplate: state.siteState.blog
});

const mapDispatchToProps = dispatch => ({
  get: (url, type) => dispatch(get(url, type)),
  scrollToPosition: (pos) => dispatch(scrollToPosition(pos))
});

export default connect(mapStateToProps, mapDispatchToProps)(Blog);
