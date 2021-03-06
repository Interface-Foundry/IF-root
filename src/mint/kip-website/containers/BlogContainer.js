import { connect } from 'react-redux';
import Blog from '../components/Blog';
import {get } from '../actions';

const mapStateToProps = (state, props) => ({
  posts: state.auth.posts,
  blogTemplate: state.siteState.blog,
  src: sessionStorage.src || state.siteState.src
});

const mapDispatchToProps = dispatch => ({
  get: (url, type) => dispatch(get(url, type))
});

export default connect(mapStateToProps, mapDispatchToProps)(Blog);
