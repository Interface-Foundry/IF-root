import React, { PropTypes, Component } from 'react';
import { Icon } from '..'

export default class Header extends Component {
  render() {
    const { changeModalComponent } = this.props;
    return (
      <nav className='item__header'>
        <button onClick={() => changeModalComponent(null)}>
          <Icon icon='Clear'/>
        </button>
        <p>Select from options below</p>
      </nav>
    );
  }
}
