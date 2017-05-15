/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
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

const rows = [
  { 
    icon: <Lightbulb/>,
    blurb: 'Browse Items or Paste a URL to Add Things to Your Kip Cart', 
    src: 'https://storage.googleapis.com/kip-random/demo_1_desktop.gif' 
  },
  { 
    icon: <Layers/>,
    blurb: 'Use Kip to Store the Items you Love in the Cloud.',
    src: 'https://storage.googleapis.com/kip-random/demo_2_desktop.gif' 
  },
  { 
    icon: <Mouse/>,
    blurb: 'Invite friends to Add to Your Kip Cart, Share Shipping and Other Fees',
    src: 'https://storage.googleapis.com/kip-random/demo_3_desktop.gif' 
  }
]

export default class Showcase extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    rows.map((row) => {
      let img = new Image()
      img.src = row.src;
    })
  }

  componentDidMount() {
    const { _registerHeight } = this.props;

    _registerHeight(ReactDOM.findDOMNode(this)
      .offsetTop, ReactDOM.findDOMNode(this)
      .clientHeight)
  }

  render() {
    const { animationState } = this.props;
    return (
      <div className={`showcase-${animationState}`}> 
        <svg className={`sine-${animationState}`} width="100%" height="50px" viewBox="0 0 100 31" preserveAspectRatio="none">
          <g>
            <path d="M0,26.5c9.7,3.8,20.3,4.2,30.3,0.9c1.9-0.6,3.8-1.4,5.7-2.2c10.6-4.5,20.7-10.2,31.1-15.1s21.4-9,32.9-10
              v31.7H0V26.5z"/>
          </g>
        </svg>
        {
          rows.map((row, i) => {
            return (
              <div key={i} className='row-1'>
                <div className={`phone image ${i !== animationState ? '' : 'enter'} ${i < animationState ? 'leave' : ''}`}> 
                  <div className='image gif'
                          style={ { backgroundImage: `url(${row.src})` } }/>
                </div>
                <div className={`bubble ${i !== animationState ? '' : 'enter'} ${i < animationState ? 'leave' : ''}`}>
                  {row.icon}
                  <h1>{row.blurb}</h1>
                </div>
              </div>
            )
          })
        }
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
