/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';

import { Footer } from '..';

import { Icon } from '../../themes';
import { Down, Right, EmailDrawn, FacebookDrawn, TwitterDrawn } from '../../themes/newSvg';

export default class About extends Component {

  render() {

    return (
      <div className="about"> 
        <section className="about__header">
          <div className='video'>
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/QPlBeTJqF1Y?rel=0&amp;showinfo=0" frameBorder="0" allowFullScreen></iframe>
          </div>
          <div className="more">
            <h2><span>Read More</span></h2>
            <Down/>
          </div>
        </section>
        <div className="icons">
          <div className="icon col-1"/>
          <div className="icon col-1"><Icon icon='Fastcompany'/></div>
          <div className="icon col-1"><Icon icon='Time'/></div>
          <div className="icon col-1"><Icon icon='Venturebeat'/></div>
          <div className="icon col-1"><Icon icon='Paymentsource'/></div>
          <div className="icon col-1"><Icon icon='Wallstreet'/></div>
          <div className="icon col-1"/>
        </div>
      </div>
    );
  }
}