/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom'

import { Footer } from '..';
import { HeaderContainer } from '../../containers';

import { Icon } from '../../themes';
import { Down, Right, EmailDrawn, FacebookDrawn, TwitterDrawn } from '../../themes/newSvg';

export default class Blog extends Component {
  constructor(props) {
      super(props)
  }

  state = {
    offsetTop: 0
  }

  componentDidMount() {
    this.setState({
      offsetTop: ReactDOM.findDOMNode(this.blogs).offsetTop
    })
  }

  render() {
    const { props: { posts }, state: { offsetTop } } = this;

    return (
      <div className="blog"> 
        <HeaderContainer title={'Conversations in Commerce'} subtext={['Case Studies Findings', 'Thoughts on Building Kip']} color="third" offsetTop={offsetTop}/>
        <section className="blogs" ref={(blogs) => this.blogs = blogs}>
          {
            posts.map((post) => {
              return <a key={post.postSrc} className='col-6 blog__post' href={post.postSrc}>
                <div className='image' style={{backgroundImage: `url(${post.imageSrc || 'https://storage.googleapis.com/kip-random/head%40x2.png'})`}}/>
                <h1>{post.title}</h1>
                <p>{moment(post.firstPublishedAt).format('LLL')}</p>
              </a>
            })
          }
        </section>
        <Footer/>
      </div>
    );
  }
}