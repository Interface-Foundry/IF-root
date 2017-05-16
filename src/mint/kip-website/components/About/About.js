/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

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

const randomGifCacheNumber = Math.random(8000);

export default class About extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.animationState !== this.props.animationState && window.innerWidth < 600) return true

    return false
  }

  render() {
    const icons = [
      Burger,
      Clock,
      DesktopIcon,
      Happy,
      Layers,
      Milk,
      Mouse,
      Paper,
      Pencil,
      Pizza,
      Happy,
      Lightbulb
    ],
    { animationState } = this.props;

    return (
      <div className="about"> 
        {
          icons.map((Icon, key) => {
            return <div key={key} style={{width: `${Math.floor(Math.random() * (40 - 15)) + 15}%`}} className={`icon`}><Icon/></div>
          })
        }           
        <div className={`image gif-${animationState}`} style={{ backgroundImage: animationState > -2 ? `url(https://storage.googleapis.com/kip-random/website/kip_star.gif?dummy=${randomGifCacheNumber})` : null }}/>
      </div>
    );
  }
}