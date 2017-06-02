
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';

export default class Input extends Component {

  render() {
    const { props: { toggleHistory, storeName, showHistory, cart : { store = '' } } } = this;

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
