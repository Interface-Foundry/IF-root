import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Right } from '../../themes/newSvg';

export default class CallToAction extends Component {
  static propTypes = {
    ctaTemplate: PropTypes.object
  }
  render() {
    const { ctaTemplate: { howItWorksAction, web, slack } } = this.props;
    return (
      <div className='call-to-action container col-12'>
        <div className='learn-more action'>
          <a href='/howitworks'>
            <button>
              <span>{howItWorksAction} <Right/> </span>
            </button>
          </a>
        </div>
        <div className='join-web box action'>
          <div className='web image' style={{backgroundImage: `url(${web.img})`}}/>
          <h2>{web.hed}</h2>
          <p>{web.desc}</p>
          <a href='/newcart'>
            <button>
              <span>{web.action} <Right/></span>
            </button>
          </a>
        </div>
        <div className='add-to-slack box action'>           
         <div className='slack image' style={{backgroundImage: `url(${slack.img})`}}/>
         <h2>{slack.hed}</h2>
         <p>{slack.desc}</p>
          <a href='https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459'>
            <button>
              <span>{slack.action} <Right/></span>
            </button>
          </a>
        </div>
      </div>
    );
  }
}
