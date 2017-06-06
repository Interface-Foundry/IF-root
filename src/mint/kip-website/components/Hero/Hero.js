/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { Down, Right } from '../../themes/newSvg';
import { replaceHtml } from '../../utils';
export default class Hero extends Component {
  static propTypes = {
    animate: PropTypes.bool,
    offsetTop: PropTypes.number,
    src: PropTypes.string,
    scrollToPosition: PropTypes.func,
    heroTemplate: PropTypes.object
  }
  componentWillMount() {
    // Preload gif
    const { heroTemplate: { imgUrl } } = this.props;
    let img = new Image();
    img.src = imgUrl;
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    return nextProps.animate !== this.props.animate
      || nextProps.heroTemplate.headline !== this.props.heroTemplate.headline
      || nextProps.offsetTop !== this.props.offsetTop;
  }

  render() {
    const { animate, src, scrollToPosition, offsetTop, heroTemplate } = this.props;
    return (
      <div className={`hero image ${animate ? 'start' : ''}`} style={{height: window.innerHeight}}>
          <div className='hero__main'>
            <div className="col-6 headline">
              <h1>
                {heroTemplate.headline}
              </h1>
              <p>
                {replaceHtml(heroTemplate.description)}
              </p>
              {
                src !== 'slack' ? <div className="col-12 action">
                  <a href='/newcart'>
                    <button>
                      <span>{heroTemplate.buttonText} <Right/></span>
                    </button>
                  </a>
                </div> : <div className="col-12 action">
                        <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>
                          {heroTemplate.slackText}
                        </button></a>
                    </div>
              }
              <p className='subtext'>
                {heroTemplate.subtext.map((text, i)=><span key={i}>{text}</span>)}
              </p>
            </div>
            <Link className="col-6 animation" to='/about'>
              <div className='image'/>
            </Link>
          </div>
          <div className="more" onClick={() => scrollToPosition(offsetTop)}>
            <h2><span>{heroTemplate.learnMore}</span></h2>
            <Down/>
          </div>
        </div>
    );
  }
}
