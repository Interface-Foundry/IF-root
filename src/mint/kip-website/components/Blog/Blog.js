/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';
import { HeaderContainer, FooterContainer } from '../../containers';

export default class Blog extends Component {
  constructor(props) {
    super(props)
  }
  static propTypes = {
    posts: PropTypes.array,
    blogTemplate: PropTypes.object,
    scrollToPosition: PropTypes.func
  }

  state = {
    offsetTop: 0
  }

  componentDidMount() {
    const { scrollToPosition } = this.props;
    this.setState({
      offsetTop: ReactDOM.findDOMNode(this.blogs)
        .offsetTop
    });
    // scrollToPosition(0);
  }

  render() {
    const { props: { posts, blogTemplate }, state: { offsetTop } } = this;

    return (
      <div className="blog">
        <HeaderContainer title={blogTemplate.titleText} subtext={blogTemplate.subtext} color="third" offsetTop={offsetTop}/>
        <section className="blogs" ref={(blogs) => this.blogs = blogs}>
          {
            posts.map((post) => {
              return <a key={post.postSrc} className='col-6 blog__post' href={post.postSrc}>
                <div className='image' style={{backgroundImage: `url(${post.imageSrc || 'https://storage.googleapis.com/kip-random/head%40x2.png'})`}}/>
                <h1>{post.title}</h1>
                <p>{moment(post.firstPublishedAt).format('LLL')}</p>
              </a>;
            })
          }
        </section>
        <FooterContainer />
      </div>
    );
  }
}
