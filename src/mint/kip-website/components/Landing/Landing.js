/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';

import { Icon } from '../../themes';
import { Banner } from '../../themes/newSvg';
import { Services, Hero, Footer, Compare } from '..';

export default class Landing extends Component {

  constructor(props) {
      super(props)
  }

  state = {
    offsetTop: 0
  }

  componentDidMount () {
    const { registerHeight } = this.props;
    registerHeight(ReactDOM.findDOMNode(this).offsetTop, ReactDOM.findDOMNode(this).clientHeight);

    this.setState({
      offsetTop: ReactDOM.findDOMNode(this.landing).offsetTop - 50
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if(
        nextState.offsetTop !== this.state.offsetTop ||
        nextProps.animationState !== this.props.animationState ||
        nextProps.fixed !== this.props.fixed
      ) {
      return true;
    }

    return false;
  }

  render() {
    const { match: { params: { src }}, fixed, animationState, scrollToPosition } = this.props,
      { offsetTop } = this.state;

    return (
      <div className="landing"> 
        <Hero animate={!fixed} src={src} scrollToPosition={scrollToPosition} offsetTop={offsetTop}/>
        <div className="icons">
          <div className="icon col-1"/>
          <div className="icon col-1"><Icon icon='Amazon'/></div>
          <div className="icon col-1"><Icon icon='Google'/></div>
          <div className="icon col-1"><Icon icon='Slack'/></div>
          <div className="icon col-1"><Icon icon='Microsoft'/></div>
          <div className="icon col-1"><Icon icon='Delivery'/></div>
          <div className="icon col-1"/>
        </div>
        
        <div ref={(landing) => this.landing = landing}>
          <Services />
        </div>
        <Compare/>
        <Footer/>
      </div>
    );
  }
}
