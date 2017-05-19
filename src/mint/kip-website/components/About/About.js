/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

export default class About extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.animationState !== this.props.animationState && window.innerWidth < 600) return true

    return false
  }

  render() {
    return (
      <div className="about"> 
        
      </div>
    );
  }
}