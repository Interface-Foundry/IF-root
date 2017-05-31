/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Right, Delete, Check } from '../../themes/newSvg';
import { Facebook, Chrome, SlackIcon, Gmail, Apple, GooglePlay } from '../../themes';

export default class Compare extends Component {

  static propTypes = {
    compareTemplate: PropTypes.object,
    src: PropTypes.string
  }

  generateSvgArray(arr) {
    return arr.map(name => {
      switch (name) {
      case 'Slack':
        return <SlackIcon/>;
      case 'Play':
        return <GooglePlay/>;
      case 'Apple':
        return <Apple/>;
      case 'Facebook':
        return <Facebook/>;
      case 'Chrome':
        return <Chrome/>;
      case 'Gmail':
        return <Gmail/>;
      }
    })
  }

  render() {

    const { compareTemplate, compareTemplate: { categories, competitors }, src } = this.props,
      actionText = src === 'slack' ? compareTemplate.slackButtonText : compareTemplate.buttonText,
      buttonLink = src === 'slack' ? 'https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459' : '/newcart';
    let counter = 0;
    return (
      <div className="compare col-12">
            <h1 className='tagline'><span>{ compareTemplate.tagline }</span></h1>
        <h4>
          {
            compareTemplate.subHead
          }
        </h4>
          <table>
            <thead>
              <tr>
                <th>&nbsp;</th>
                {
                  competitors.map((c, i) => (
                    <th key={i}>
                      <div className="image" style={{backgroundImage: `url(${c.image})`}}/>
                    </th>
                  ))
                }
              </tr>
            </thead>
            <tbody>
              {
                categories.map((c, i) => (
                  <tr key={i}>
                    <td>{c}</td>
                    {
                      competitors.map((comp, j) =>
                        typeof(comp.data[i]) === 'boolean'
                          ? comp.data[i]
                            ? <td key={counter++} className='check'> <Check /> </td>
                            : <td key={counter++}> <Delete /> </td>
                        : typeof (comp.data[i]) === 'object'
                          ? <td key={counter++}>{::this.generateSvgArray(comp.data[i])}</td>
                          : <td key={counter++}>{comp.data[i]}</td>
                      )
                    }
                  </tr>
                ))
              }
              <tr>
                <td className="col-12 action">
                    <a href={buttonLink}>
                      <button>
                        <span>{actionText} <Right/></span>
                      </button>
                    </a>
                  </td>
              </tr>
            </tbody>
        </table>
      </div>
    );
  }
}