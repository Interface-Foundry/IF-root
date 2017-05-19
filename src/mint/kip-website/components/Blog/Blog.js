/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';

import { Footer } from '..';

export default class Blog extends Component {
  render() {
    const { posts } = this.props;
    console.log(posts)
    return (
      <div className="blog"> 
        {
          posts.map((post) => (
            <a className='blog__post' href={post.postSrc}>
              <div className='image' style={{backgroundImage: `url(${post.imageSrc || 'https://storage.googleapis.com/kip-random/head%40x2.png'})`}}/>
              <h1>{post.title}</h1>
              <p>{moment(post.firstPublishedAt).format('LLL')}</p>
            </a>
          ))
        }
        <Footer/>
      </div>
    );
  }
}