import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

export default class Header extends Component {

  static propTypes = {
    title: PropTypes.string,
    subtext: PropTypes.string,
    color: PropTypes.string,
    cart: PropTypes.object
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.title !== this.props.title ||
      nextProps.subtext !== this.props.subtext ||
      nextProps.color !== this.props.color
    )
  }

  render() {
    const { title, subtext = [], color } = this.props;

    return (
      <section className={`header ${color}`}>
        <div>
          <div className='text'>
            <h1><span>{title}</span></h1>
            <p className='subtext'>
              {
                subtext.map((text) => (
                  <span key={text}>{text}</span>
                ))
              }
            </p>
          </div>
        </div>
      </section>
    );
  }
}
