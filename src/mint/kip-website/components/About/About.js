/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';

import { Footer } from '..';

import { Icon } from '../../themes';
import { Down, Right, Items, Mapper, Cloud, Person } from '../../themes/newSvg';

export default class About extends Component {

  render() {

    return (
      <div className="about"> 
        <section className="about__header">
          <div className='video'>
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/QPlBeTJqF1Y?rel=0&amp;showinfo=0" frameBorder="0" allowFullScreen></iframe>
          </div>
          <div className="more">
            <h2><span>As Seen In</span></h2>
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

        <div className="why col-12"> 
          <div className="col-12">
            <h1 className='tagline'><span>WHY PENGUINS</span></h1>
            <h4>
              <span>KIP</span> is an A.I Penguin that helps you save money
              by splitting costs between you and your friends
            </h4>
            <section className='cluster'>
              <Items/>
              <div className='inline'>
                <Down/>
                <Down/>
                <Down/>
              </div>
            </section>
            <div className="col-4 row-1 services__details">
              <Mapper/>
              <h4>
                No downloads or signups, Kip lets you shop from anywhere in the U.S, U.K, and Canada. <br/> 
              </h4>
              <div className="col-12 row-1 action">
                <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Create a KIP Cart <Right/></span></button></a>
              </div>
            </div>

            <div className="col-4 row-1 services__details">
              <Cloud/>
              <h4> 
                Kip keeps your cart in the cloud and provides you with a unique short URL to share. <br/> 
              </h4>
              <div className="col-12 row-1 action">
                <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Create a KIP Cart <Right/></span></button></a>
              </div>
            </div>

            <div className="col-4 row-1 services__details">
              <Person/>
              <h4> 
                Connect with you friends and never miss out on the things you need. 
              </h4>
              <div className="col-12 row-1 action">
                <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Create a KIP Cart <Right/></span></button></a>
              </div>
            </div>

            <span className="col-12 action red">
              <a href='/newcart'>
                <button>
                  <span>Try Kip Now <Right/></span>
                </button>
              </a>
            </span>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }
}