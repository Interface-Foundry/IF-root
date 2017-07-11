/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';

import { Legal, ComparisonPage } from '..';
import { SidenavContainer, ModalContainer, RibbonContainer, LandingContainer, BlogContainer, HelpContainer, AboutContainer } from '../../containers';

import { Route } from 'react-router-dom';

export default class App extends Component {

  static propTypes = {
    animate: PropTypes.bool,
    location: PropTypes.object,
    fixed: PropTypes.bool,
    sidenav: PropTypes.bool,
    modal: PropTypes.bool,
    animationOffset: PropTypes.number,
    containerHeight: PropTypes.number,
    scrollTo: PropTypes.number
  }

  componentDidMount = () => this.scroll.addEventListener('scroll', ::this._handleScroll);

  componentWillUnmount = () => this.scroll.removeEventListener('scroll', ::this._handleScroll);

  shouldComponentUpdate({ location, animate, fixed, sidenav, modal, animationOffset, containerHeight, scrollTo }, nextState) {
    // need this, otherwise page always rerender every scroll
    return location.pathname !== this.props.location.pathname
      || animate !== this.props.animate
      || fixed !== this.props.fixed
      || sidenav !== this.props.sidenav
      || modal !== this.props.modal
      || animationOffset !== this.props.animationOffset
      || containerHeight !== this.props.containerHeight
      || scrollTo !== this.props.scrollTo;
  }

  componentWillReceiveProps = ({ scrollTo }) => scrollTo !== this.props.scrollTo
    ? window.scrollTop = scrollTo : null;

  _handleScroll(e) {
    const scrollTop = this.scroll
      .scrollTop,
      { fixed, animationState, animationOffset, containerHeight, handleScroll } = this.props;
    // animate scroll, needs height of the container, and its distance from the top
    handleScroll(containerHeight, animationOffset, scrollTop, animationState, fixed);
  }

  render() {
    const { sidenav, modal, match, siteVersion } = this.props;

    return (
      <div className='app'>
          { sidenav ? <SidenavContainer /> : null }
          { modal ? <ModalContainer /> : null }
          <RibbonContainer />
          <div className='app__view' ref={(scroll) => this.scroll = scroll}>
            <Route path={`${match.url}`} exact component={LandingContainer}/>
            <Route path={`${match.url}s/:src`} exact component={LandingContainer}/>
            <Route path={`${match.url}legal`} exact component={Legal}/>
            <Route path={`${match.url}blog`} exact component={BlogContainer}/>
            <Route path={`${match.url}howitworks`} exact component={HelpContainer}/>
            <Route path={`${match.url}about`} exact component={AboutContainer}/>
            <Route path={`${match.url}compare`} exact component={ComparisonPage}/>
          </div>
        </div>
    );
  }
}
