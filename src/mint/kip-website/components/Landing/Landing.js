/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';

import { Icon } from '../../themes';
import { Banner } from '../../themes/newSvg';
import { Services, Hero, Footer, Compare } from '..';

export default class Landing extends Component {

  componentDidMount () {
    const { registerHeight } = this.props;
    registerHeight(ReactDOM.findDOMNode(this).offsetTop, ReactDOM.findDOMNode(this).clientHeight);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if(
        nextProps.animationState !== this.props.animationState ||
        nextProps.fixed !== this.props.fixed
      ) {
      return true;
    }

    return false
  }

  render() {
    const { match: { params: { src }}, registerHeight, fixed, animationState } = this.props;

    return (
      <div className="landing"> 
        <Hero animate={!fixed} src={src}/>
        <div className="icons">
          <div className="icon col-1"/>
          <div className="icon col-1"><Icon icon='Amazon'/></div>
          <div className="icon col-1"><Icon icon='Google'/></div>
          <div className="icon col-1"><Icon icon='Slack'/></div>
          <div className="icon col-1"><Icon icon='Microsoft'/></div>
          <div className="icon col-1"><Icon icon='Delivery'/></div>
          <div className="icon col-1"/>
        </div>
        
        <Services/>
        <Compare/>
        <Footer/>
      </div>
    );
  }
}
