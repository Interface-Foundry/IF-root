/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { animateScroll } from '../../utils';

import { Services, About, Showcase, Footer, Statement, Hero } from '..';
import { SidenavContainer, ModalContainer, RibbonContainer } from '../../containers';


export default class Landing extends Component {

  constructor(props) {
    super(props);
    this._handleScroll = ::this._handleScroll;
    this._toggleSidenav = ::this._toggleSidenav;
    this._toggleModal = ::this._toggleModal;
    this._registerHeight = ::this._registerHeight;

    this.state = {
      fixed: false,
      sidenav: false,
      modal: false,
      animationOffset: 0,
      containerHeight: 0,
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
    const scrollTop = ReactDOM.findDOMNode(this.landing).scrollTop,
      { state: { fixed, animationState, animationOffset, containerHeight }} = this;

    // stops and starts header animation, and fixes navbar to top;
    if(scrollTop > 400 && !fixed ||  scrollTop <= 400 && fixed) {
      this.setState({
        fixed: scrollTop > 400
      })
    }

    // animate scroll, needs height of the container, and its distance from the top
    this.setState(animateScroll(containerHeight, animationOffset, scrollTop, animationState, window.innerWidth < 600))
  }

  _toggleSidenav () {
    const { sidenav } = this.state;

    this.setState({ sidenav: !sidenav });
  }

  _toggleModal () {
    const { modal } = this.state;

    this.setState({ modal: !modal });
  }

  _registerHeight (heightFromTop, containerHeight) {
    this.setState({
      animationOffset: heightFromTop,
      containerHeight: containerHeight
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if(
        nextState.animationState !== this.state.animationState ||
        nextState.fixed !== this.state.fixed ||
        nextState.sidenav !== this.state.sidenav ||
        nextState.modal !== this.state.modal 
      ) {
      return true;
    }

    return false
  }

  render() {
    const { state: { fixed, sidenav, modal, animationState }, props: { currentUser, match: { params: { src }} }, _handleScroll, _toggleSidenav, _toggleModal, _registerHeight } = this;

    return (
      <span>
        { sidenav ? <SidenavContainer _toggleSidenav={_toggleSidenav} _toggleModal={_toggleModal}/> : null }
        { modal ? <ModalContainer _toggleModal={_toggleModal} /> : null }

        <div className="landing" ref={(landing) => this.landing = landing}> 
          <RibbonContainer fixed={fixed} src={src} _toggleSidenav={_toggleSidenav} _toggleModal={_toggleModal}/>
          <Hero animate={!fixed} />
          <Statement _toggleModal={_toggleModal} src={src}/>
          <About animationState={animationState} animate={animationState.includes('fixed')}/>
          <Showcase animationState={animationState} _registerHeight={_registerHeight}/>
          <Services _toggleModal={_toggleModal}/>
          <Footer/>
        </div>
      </span>
    );
  }
}