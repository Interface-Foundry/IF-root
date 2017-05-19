/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import { Services, About, Showcase, Statement, Hero, Footer } from '..';


export default class Landing extends Component {
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
    const { match: { params: { src }}, registerHeight, fixed, animationState }= this.props;

    return (
      <div className="landing"> 
        <Hero animate={!fixed} src={src}/>
        <Services/>
        <Footer/>
      </div>
    );
  }
}