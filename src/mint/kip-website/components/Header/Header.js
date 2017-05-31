/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';
import Scroll from 'react-scroll';

import { Icon } from '../../themes';
import { Down, Right, EmailDrawn, FacebookDrawn, TwitterDrawn } from '../../themes/newSvg';

export default class Header extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if(
      nextProps.title !== this.props.title ||
      nextProps.subtext !== this.props.subtext ||
      nextProps.color !== this.props.color
    ) return true

    return false
  }

  render() {
    const { title, subtext = [], color, offsetTop, scrollToPosition, headerTemplate } = this.props;

    return (
      <section className={`header ${color}`}>
        <div>
          <div className='text'>
            <h1><span>{title}</span></h1>
            <p className='subtext'>
              {
                subtext.map((text) => (
                  <span key={text}>{text}</span>
                ))
              }
            </p>
          </div>
          <div className="icons">
            <a href="mailto:hello@kipthis.com?subject=Subscribe"><EmailDrawn/></a>
            <a href="//www.facebook.com/talkto.kip"><FacebookDrawn/></a>
            <a href="//twitter.com/kiptalk"><TwitterDrawn/></a>
          </div>
        </div>
        <div className="more" onClick={() => scrollToPosition(offsetTop)}>
          <h2><span>{headerTemplate.readMoreText}</span></h2>
          <Down/>
        </div>
      </section>
    );
  }
}