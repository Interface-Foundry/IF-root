/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';

import { animateScroll } from '../../utils';

import { Services, About, Showcase, Footer, Statement, Hero } from '..';
import { SidenavContainer, ModalContainer, RibbonContainer } from '../../containers';

export default class Landing extends Component {

  static propTypes = {
    name: PropTypes.string,
    updateCarts: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this._handleScroll = ::this._handleScroll;
    this._toggleSidenav = ::this._toggleSidenav;
    this._toggleLoginScreen = ::this._toggleLoginScreen;
    this._registerHeight = ::this._registerHeight;

    this.state = {
      fixed: false,
      sidenav: false,
      modal: false,
      animationOffset: 0,
      containerHeight: 0,
      animationState: -2
    };
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.landing)
      .addEventListener('scroll', this._handleScroll);
  }

  componentWillUnmount() {
    ReactDOM.findDOMNode(this.landing)
      .removeEventListener('scroll', this._handleScroll);
  }

  componentWillReceiveProps(nextProps) {
    const { name, updateCarts } = this.props, { name: nextName } = nextProps;
    if (nextName !== name && nextName) {
      updateCarts();
    }
  }

  _handleScroll(e) {
    const scrollTop = ReactDOM.findDOMNode(this.landing)
      .scrollTop,
      { state: { fixed, animationState, animationOffset, containerHeight } } = this;

    // stops and starts header animation, and fixes navbar to top;
    if (scrollTop > 400 && !fixed || scrollTop <= 400 && fixed) {
      this.setState({
        fixed: scrollTop > 400
      })
    }

    // animate scroll, needs height of the container, and its distance from the top
    this.setState(animateScroll(containerHeight, animationOffset, scrollTop, animationState))
  }

  _toggleSidenav() {
    const { sidenav } = this.state;

    this.setState({ sidenav: !sidenav });
  }

  _toggleLoginScreen() {
    const { modal } = this.state;

    this.setState({ modal: !modal });
  }

  _registerHeight(heightFromTop, containerHeight) {
    this.setState({
      animationOffset: heightFromTop,
      containerHeight: containerHeight
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if (
      nextState.animationState !== this.state.animationState
      || nextState.fixed !== this.state.fixed
      || nextState.sidenav !== this.state.sidenav
      || nextState.modal !== this.state.modal
      || nextState.name !== this.props.name
    ) {
      return true;
    }

    return false
  }

  render() {
    const {
      state: { fixed, sidenav, modal, animationState },
      props: { match: { params: { src } } },
      _toggleSidenav,
      _toggleLoginScreen,
      _registerHeight
    } = this;

    return (
      <span>
        { modal ? <ModalContainer _toggleLoginScreen={_toggleLoginScreen} /> : null }

        <div className="landing" ref={(landing) => this.landing = landing}> 
          <RibbonContainer fixed={fixed} src={src} _toggleSidenav={_toggleSidenav} _toggleModal={_toggleLoginScreen}/>
          <Hero animate={!fixed} />
          <Statement _toggleModal={_toggleLoginScreen} src={src}/>
          <About animationState={animationState}/>
          <Showcase animationState={animationState} _registerHeight={_registerHeight}/>
          <Services _toggleModal={_toggleLoginScreen}/>
          <Footer/>
        </div>
        { sidenav ? <SidenavContainer _toggleSidenav={_toggleSidenav} _toggleModal={_toggleLoginScreen}/> : null }
      </span>
    );
  }
}
