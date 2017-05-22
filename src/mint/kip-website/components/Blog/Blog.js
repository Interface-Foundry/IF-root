/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';

import { Footer } from '..';

import { Icon } from '../../themes';
import { Down, Right, EmailDrawn, FacebookDrawn, TwitterDrawn } from '../../themes/newSvg';

export default class Blog extends Component {

  render() {
    const { posts } = this.props;

    return (
      <div className="blog"> 
        <section className="blog__header">
          <div>
            <div className='text'>
              <h1><span>Conversations in Commerce</span></h1>
              <p className='subtext'>
                <span>Case Studies Findings</span>
                <span>Thoughts on Building Kip</span>
              </p>
            </div>
            <div className="icons">
              <a href="mailto:hello@kipthis.com?subject=Subscribe"><EmailDrawn/></a>
              <a href="//www.facebook.com/talkto.kip"><FacebookDrawn/></a>
              <a href="//twitter.com/kiptalk"><TwitterDrawn/></a>
            </div>
          </div>
          <div className="more">
            <h2><span>Read More</span></h2>
            <Down/>
          </div>
        </section>
        <section className="blogs">
          {
            posts.map((post) => {
              return <a className='col-6 blog__post' href={post.postSrc}>
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