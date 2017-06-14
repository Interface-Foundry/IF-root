// react/components/Header/Input.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../react-common/components';

export default class Input extends Component {
  static propTypes = {
    cart: PropTypes.object
  }

  render() {
    const { props: { cart: { store = '' } } } = this;

    return (
      <div className='input'>
        <input placeholder={`Search or Paste ${store.toUpperCase()} URL`} autoFocus autoComplete="off" spellCheck='true'/>
        <button type='submit'>
            <Icon icon='Search'/>
        </button>
      </div>
    );
  }
}
