/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import { Ribbon, Services, About, Showcase, Reviews, Footer } from '..';
import { HeroContainer, StatementContainer } from '../../containers';


export default class Landing extends Component {

  constructor(props) {
    super(props);
    this._handleScroll = ::this._handleScroll;
    this.state = {
      fixed: false
    };
  }

  componentDidMount () {
    ReactDOM.findDOMNode(this).addEventListener('scroll', this._handleScroll);
  }

  componentWillUnmount () {
    ReactDOM.findDOMNode(this).removeEventListener('scroll', this._handleScroll);
  }

  _handleScroll (e) {
    let scrollTop = ReactDOM.findDOMNode(this).scrollTop;

    this.setState({
      fixed: scrollTop > 400
    })
  }

  render() {
    const { state: { fixed }, props: { _toggleSidenav } } = this;
    return (
      <div className="landing"> 
        <Ribbon fixed={fixed} _toggleSidenav={_toggleSidenav}/>
        <HeroContainer/>
        <StatementContainer/>
        <Services/>
        <About/>
        <Showcase/>
        <Footer/>
      </div>
    );
  }
}