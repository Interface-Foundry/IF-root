/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Right, Cloud, Person, Items, Mapper, Down } from '../../themes/newSvg';
import { replaceHtml } from '../../utils';
export default class Services extends Component {
  static propTypes = {
    servicesTemplate: PropTypes.object,
    src: PropTypes.string
  }

  icons = [<Mapper key={1}/>, <Cloud key={2}/>, <Person key={3}/>]

  render() {
    const { icons, props: { servicesTemplate, src } } = this;
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
            icons.map((icon, i) =>(
              <div key={i} className='col-4 row-1 services__details'>
                {icon}
                <h4>
                  {servicesTemplate.details.descrips[i]}
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