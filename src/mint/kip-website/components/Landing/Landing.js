/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';

import { Icon } from '../../themes';
import { HeroContainer, ServicesContainer, CompareContainer, FooterContainer } from '../../containers';

export default class Landing extends Component {

  static propTypes = {
    animationState: PropTypes.number,
    fixed: PropTypes.bool,
    registerHeight: PropTypes.func,
    match: PropTypes.object,
    setSource: PropTypes.func
  }

  state = {
    offsetTop: 0
  }

  componentDidMount() {
    const { registerHeight, setSource, match: { params: { src } } } = this.props;
    registerHeight(ReactDOM.findDOMNode(this)
      .offsetTop, ReactDOM.findDOMNode(this)
      .clientHeight);
    sessionStorage.src = src ? src : sessionStorage.src ? sessionStorage.src : '';
    setSource(sessionStorage.src);
    this.setState({
      offsetTop: ReactDOM.findDOMNode(this.landing)
        .offsetTop - 50
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    return nextState.offsetTop !== this.state.offsetTop || nextProps.animationState !== this.props.animationState || nextProps.fixed !== this.props.fixed;
  }

  render() {
    const { offsetTop } = this.state;
    return (
      <div className="landing">
        <HeroContainer offsetTop={offsetTop}/>
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
          <ServicesContainer />
        </div>
        <CompareContainer />
        <FooterContainer />
      </div>
    );
  }
}
