/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import { Ribbon, Services, About, Showcase, Reviews, Footer } from '..';
import { HeroContainer, StatementContainer, SidenavContainer, ModalContainer } from '../../containers';


export default class Landing extends Component {

  constructor(props) {
    super(props);
    this._handleScroll = ::this._handleScroll;
    this._toggleSidenav = ::this._toggleSidenav;
    this._toggleModal = ::this._toggleModal;
    this.state = {
      fixed: false,
      sidenav: false,
      modal: false
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

    this.setState({
      fixed: scrollTop > 400
    })
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
    const { state: { fixed, sidenav, modal}, _handleScroll, _toggleSidenav, _toggleModal } = this;
    return (
      <span>
        { sidenav ? <SidenavContainer _toggleSidenav={_toggleSidenav} _toggleModal={_toggleModal}/> : null }
        { modal ? <ModalContainer _toggleModal={_toggleModal}/> : null }

        <div className="landing" ref={(landing) => this.landing = landing}> 
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