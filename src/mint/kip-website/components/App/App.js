/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { PropTypes } from 'prop-types';

import { Legal, WhyKip, Help } from '..';
import { SidenavContainer, ModalContainer, RibbonContainer, LandingContainer, BlogContainer } from '../../containers';

import { Route } from 'react-router-dom';

export default class App extends Component {
	constructor(props) {
	    super(props)
	    this._handleScroll = :: this._handleScroll;
	}

	componentDidMount () {
	    const { _handleScroll } = this;
	    ReactDOM.findDOMNode(this.scroll).addEventListener('scroll', _handleScroll);
	}

	componentWillUnmount () {
	    const { _handleScroll } = this;
	    ReactDOM.findDOMNode(this.scroll).removeEventListener('scroll', _handleScroll);
	}

	shouldComponentUpdate(nextProps, nextState) {
   		 // need this, otherwise page always rerender every scroll
	   	if(
	   		nextProps.location.pathname !== this.props.location.pathname ||
	   		nextProps.animate !== this.props.animate ||
	   		nextProps.fixed !== this.props.fixed ||
	   		nextProps.sidenav !== this.props.sidenav ||
	   		nextProps.modal !== this.props.modal ||
	   		nextProps.animationOffset !== this.props.animationOffset ||
	   		nextProps.containerHeight !== this.props.containerHeight ||
	   		nextProps.scrollTo !== this.props.scrollTo
	   	) return true

    	return false
  	}

  	componentWillReceiveProps(nextProps) {
  		if(nextProps.scrollTo !== this.props.scrollTo && nextProps.scrollTo !== 0) {
  			ReactDOM.findDOMNode(this.scroll).scrollTop = nextProps.scrollTo
  		}
  	}

	_handleScroll (e) {
	    const scrollTop = ReactDOM.findDOMNode(this.scroll).scrollTop,
	      { fixed, animationState, animationOffset, containerHeight, handleScroll } = this.props;

	    // animate scroll, needs height of the container, and its distance from the top
	    handleScroll(containerHeight, animationOffset, scrollTop, animationState, fixed)
	}

	render() {
		const { sidenav, modal, match } = this.props;

	  	return (
	      <div className='app'>
	        { sidenav ? <SidenavContainer /> : null }
	        { modal ? <ModalContainer /> : null }
	        <RibbonContainer src={match.params.src} />
	        <div className='app__view' ref={(scroll) => this.scroll = scroll}>
		      	<Route path={`${match.url}`} exact component={LandingContainer}/>
	      		<Route path={`${match.url}s/:src`} exact component={LandingContainer}/>
		      	<Route path={`${match.url}legal`} exact component={Legal}/>
		      	<Route path={`${match.url}blog`} exact component={BlogContainer}/>
		      	<Route path={`${match.url}help`} exact component={Help}/>
		      	<Route path={`${match.url}whykip`} exact component={WhyKip}/>
	      	</div>
	      </div>
	    );
	}
}
