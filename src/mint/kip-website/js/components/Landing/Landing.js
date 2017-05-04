/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import { desktopScroll, mobileScroll } from '../../reducers';

import { Ribbon, Services, About, Showcase, Footer } from '..';
import { HeroContainer, StatementContainer, SidenavContainer, ModalContainer } from '../../containers';


export default class Landing extends Component {

  constructor(props) {
    super(props);
    this._handleScroll = ::this._handleScroll;
    this._toggleSidenav = ::this._toggleSidenav;
    this._toggleModal = ::this._toggleModal;

    // check to see if we need mobile or desktop scroll
    this._animateScroll = window.innerWidth > 600 ? desktopScroll : mobileScroll;
    this.state = {
      fixed: false,
      sidenav: false,
      modal: false,
      animationState: 'inital'
    };
  }

  componentDidMount () {
    ReactDOM.findDOMNode(this.landing).addEventListener('scroll', this._handleScroll);
  }

  componentWillUnmount () {
    ReactDOM.findDOMNode(this.landing).removeEventListener('scroll', this._handleScroll);
  }

  _handleScroll (e) {
    let scrollTop = ReactDOM.findDOMNode(this.landing).scrollTop;
    const { state: { fixed, animationState }, _animateScroll} = this;

    // stops and starts header animation, and fixes navbar to top;
    if(scrollTop > 400 && !fixed ||  scrollTop <= 400 && fixed) {
      this.setState({
        fixed: scrollTop > 400
      })
    }

    // animate using mobile or desktop scroll;
    this.setState(_animateScroll(scrollTop, animationState))
  }

  _toggleSidenav () {
    const { sidenav } = this.state;

    this.setState({ sidenav: !sidenav });
  }

  _toggleModal () {
    const { modal } = this.state;

    this.setState({ modal: !modal });
  }

  render() {
    const { state: { fixed, sidenav, modal, animationState }, _handleScroll, _toggleSidenav, _toggleModal } = this;
    return (
      <span>
        { sidenav ? <SidenavContainer _toggleSidenav={_toggleSidenav} _toggleModal={_toggleModal}/> : null }
        { modal ? <ModalContainer _toggleModal={_toggleModal}/> : null }

        <div className="landing" ref={(landing) => this.landing = landing}> 
          <Ribbon fixed={fixed} _toggleSidenav={_toggleSidenav}/>
          <HeroContainer animate={!fixed}/>
          <StatementContainer _toggleModal={_toggleModal}/>
          <About animationState={animationState} animate={animationState.includes('fixed')}/>
          <Showcase animationState={animationState}/>
          <Services _toggleModal={_toggleModal}/>
          <Footer/>
        </div>
      </span>
    );
  }
}