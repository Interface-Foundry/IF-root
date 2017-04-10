import React, { PropTypes, Component } from 'react';
import { Icon } from '..'

export default class Header extends Component {
  render() {
    const { replace, cart_id } = this.props;
    return (
      <nav className='item__header'>
        <button onClick={() => replace(`/cart/${cart_id}/`)}>
          <Icon icon='Clear'/>
        </button>
        <p>Select from options below</p>
      </nav>
    );
  }
}