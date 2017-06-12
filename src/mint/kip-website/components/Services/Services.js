/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Right, Items, Down } from '../../themes/newSvg';
import { replaceHtml } from '../../utils';
export default class Services extends Component {
  static propTypes = {
    servicesTemplate: PropTypes.object,
    src: PropTypes.string
  }

  render() {
    const { servicesTemplate, src } = this.props;
    const linkLoc = src === 'slack'
      ? 'https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459'
      : '/newcart';
    const actionText = src === 'slack'
      ? servicesTemplate.details.slackActionText
      : servicesTemplate.details.actionText;
    return (
      <div className='services col-12'>
        <div className='col-12'>
          <h1 className='tagline'><span>{servicesTemplate.tagline}</span></h1>
          <h4>
            { replaceHtml(servicesTemplate.tagDescrip) }
          </h4>
          <section className='cluster'>
            <Items/>
            <div className='inline'>
              <Down/>
              <Down/>
              <Down/>
            </div>
          </section>
          {
            servicesTemplate.details.descrips.map((d, i) =>(
              <div key={i} className='col-4 row-1 services__details'>
                <div className='image serviceImage' style={{backgroundImage: `url(${d.image})`}}/>
                <h4>
                  {d.text}
                </h4>
                <div className='col-12 row-1 action'>
                  <a href={linkLoc} target='_blank'><button><span>{actionText} <Right/></span></button></a>
                </div>
              </div>))
          }
        </div>
      </div>
    );
  }
}
