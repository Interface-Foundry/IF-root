/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import { Ribbon, Services, About, Showcase, Reviews, Footer } from '..';
import { HeroContainer, StatementContainer, SidenavContainer } from '../../containers';


export default class Landing extends Component {

  constructor(props) {
    super(props);
    this._handleScroll = ::this._handleScroll;
    this._toggleSidenav = ::this._toggleSidenav;
    this.state = {
      fixed: false,
      sidenav: false
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

  _toggleSidenav () {
    const { sidenav } = this.state;

    this.setState({ sidenav: !sidenav });
  }

  render() {
    const { state: { fixed, sidenav }, _handleScroll, _toggleSidenav } = this;
    return (
      <span>
        { sidenav ? <SidenavContainer _toggleSidenav={_toggleSidenav}/> : null }

        <div className="landing"> 
          <Ribbon fixed={fixed} _toggleSidenav={_toggleSidenav}/>
          <HeroContainer/>
          <StatementContainer/>
          <Services/>
          <About/>
          <Showcase/>
          <Footer/>
        </div>
      </span>
    );
  }
}