/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Hills, FacebookDrawn, EmailDrawn, TwitterDrawn } from '../../themes/newSvg';

export default class Footer extends Component {
  static propTypes = {
    footerTemplate: PropTypes.object
  }
  render() {
    const { footerTemplate } = this.props;
    return (
      <footer className="footer">
        <p>
          {
            footerTemplate.links.map((link, i) => (
              <span key={i}>
                <a href={link.link}>{link.title}</a>
                {i === footerTemplate.links.length - 1 ? '' : ' - ' }
              </span>
            ))
          }
          </p>

            <p>Kip © 2017 – Contact: hello@kipthis.com</p>
            <div className="footer__icons">
              <a href="mailto:hello@kipthis.com?subject=Subscribe"><EmailDrawn/></a>
              <a href="//www.facebook.com/talkto.kip"><FacebookDrawn/></a>
              <a href="//twitter.com/kiptalk"><TwitterDrawn/></a>
            </div>
            <Hills/>
          </footer>
    );
  }
}