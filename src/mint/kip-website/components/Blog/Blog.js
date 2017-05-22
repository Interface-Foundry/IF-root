/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';

import { Footer } from '..';

import { Icon } from '../../themes';
import { Down, Right } from '../../themes/newSvg';

export default class Blog extends Component {
  constructor(props) {
    super(props)
    this._startAnimation = this._startAnimation.bind(this)
    this.state = {
      sliderIndex: 0
    }
  }

  _startAnimation(stop) {
    const { posts } = this.props,
          { sliderIndex } = this.state,
          length = posts.length - 1;

    if(stop) {
      if(self)
        clearTimeout(self.timeout)

      clearTimeout(this.timeout)
    } else {
      let self = this
      self.timeout = setTimeout(() => {

        this.setState({sliderIndex: sliderIndex === length ? 0 : sliderIndex+1})
        self._startAnimation()
      }, 7000);
    }
  }

  componentWillMount() {
    const { get, customer, account } = this.props

    this._startAnimation()
  }

  componentWillUnmount() {
    this._startAnimation(true)
  }

  render() {
    const { posts } = this.props,
          { sliderIndex } = this.state;

    console.log(sliderIndex);
    return (
      <div className="blog"> 
        <section className="blog__header" style={{height: window.innerHeight}}>
          <div className='text'>
            <h1> We learn't alot when Builing <span>KIP</span></h1>
            <h4>Here is what we found</h4>
          </div>
          <div className="main">
            {
              posts.map((post, i) => {
                if(i !== sliderIndex) return null;

                return (
                  <div className="header">
                    <div className='image' style={{backgroundImage: `url(${post.imageSrc || 'https://storage.googleapis.com/kip-random/head%40x2.png'})`}}/>
                    <p>{post.title}</p>
                  </div>
                )
              })
            }
          </div>
          <div className="more">
            <h2><span>Read More</span></h2>
            <Down/>
          </div>
        </section>
        <section className="blogs">
          {
            posts.map((post) => (
              <a className='col-6 blog__post' href={post.postSrc}>
                <div className='image' style={{backgroundImage: `url(${post.imageSrc || 'https://storage.googleapis.com/kip-random/head%40x2.png'})`}}/>
                <h1>{post.title}</h1>
                <p>{moment(post.firstPublishedAt).format('LLL')}</p>
              </a>
            ))
          }
        </section>
        <Footer/>
      </div>
    );
  }
}