/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { DefaultPlayer as Video } from 'react-html5video';
import ReactDOM from 'react-dom'
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { Icon } from '../../themes';
import {
  Burger,
  Clock,
  DesktopIcon,
  Happy,
  Layers,
  Lightbulb,
  Milk,
  Mouse,
  Paper,
  Pencil,
  Pizza
} from '../../themes/kipsvg';
import {
  OfficeOutline
} from '../../themes';

const imageSrc = [
  'https://storage.googleapis.com/kip-random/demo_1_desktop.gif',
  'https://storage.googleapis.com/kip-random/demo_2_desktop.gif',
  'https://storage.googleapis.com/kip-random/demo_3_desktop.gif'
]

export default class Showcase extends Component {
  constructor(props) {
    super(props);
    this._getSource = ::this._getSource;
    this.renderBubbles = ::this.renderBubbles;
  }

  componentDidMount() {
    const { animationState, _registerHeight } = this.props;

    _registerHeight(ReactDOM.findDOMNode(this)
      .offsetTop, ReactDOM.findDOMNode(this)
      .clientHeight)
  }

  componentWillMount() {
    imageSrc.map((src) => {
      let img = new Image()
      img.src = src;
    })
  }

  _getSource() {
    const { animationState } = this.props;

    switch (animationState) {
    case 'inital':
      return 'https://storage.googleapis.com/kip-random/demo_1_desktop.gif'
    case 'fixed first':
      return 'https://storage.googleapis.com/kip-random/demo_1_desktop.gif'
    case 'fixed first bubble':
      return 'https://storage.googleapis.com/kip-random/demo_1_desktop.gif'
    case 'fixed second bubble':
      return 'https://storage.googleapis.com/kip-random/demo_2_desktop.gif'
    case 'fixed third bubble':
      return 'https://storage.googleapis.com/kip-random/demo_3_desktop.gif'
    case 'absolute':
      return 'https://storage.googleapis.com/kip-random/demo_3_desktop.gif'
    }
  }

  renderBubbles() {
    const { animationState } = this.props;

    switch (animationState) {
    case 'inital':
      return null
    case 'fixed first':
      return null
    case 'fixed first bubble':
      return <div key={animationState} className='bubble'>
          <Lightbulb/>
          <h1>Browse items or paste a URL to add things to your Kip Cart.</h1>
        </div>
    case 'fixed second bubble':
      return <div key={animationState} className='bubble'>
          <Layers/>
          <h1>Swipe and Save your Favourite Items to cart.</h1>
        </div>
    case 'fixed third bubble':
      return <div key={animationState} className='bubble'>
          <Mouse/>
          <h1>Invite friends to add to your Kip Cart, share shipping and other fees.</h1>
        </div>
    case 'absolute':
      return null
    }
  }

  render() {
    const { props: { animationState }, _getSource, renderBubbles } = this;

    return (
      <div className='showcase'> 
            <div className={`outline ${animationState}`}>
              <OfficeOutline/>
            </div>
            <div className={`phone image ${animationState}`}> 
              <CSSTransitionGroup
                transitionName="bubble"
                transitionEnterTimeout={0}
                transitionLeaveTimeout={0}>
                { renderBubbles() }
              </CSSTransitionGroup>
              <div className='image gif'
                      style={ { backgroundImage: `url(${_getSource()})` } }/>
            </div>
        <svg className="sine" width="100%" height="50px" viewBox="0 0 100 31" preserveAspectRatio="none">
          <g>
            <path d="M0,26.5c9.7,3.8,20.3,4.2,30.3,0.9c1.9-0.6,3.8-1.4,5.7-2.2c10.6-4.5,20.7-10.2,31.1-15.1s21.4-9,32.9-10
              v31.7H0V26.5z"/>
          </g>
        </svg>
        <svg className="bottom" width="100%" height="50px" viewBox="0 0 100 31" preserveAspectRatio="none">
          <g>
            <path d="M0,26.5c9.7,3.8,20.3,4.2,30.3,0.9c1.9-0.6,3.8-1.4,5.7-2.2c10.6-4.5,20.7-10.2,31.1-15.1s21.4-9,32.9-10
              v31.7H0V26.5z"/>
          </g>
        </svg>
          </div>
    );
  }
}
