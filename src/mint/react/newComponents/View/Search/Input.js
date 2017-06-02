// react/components/AmazonForm/AmazonForm.js

import React, { Component } from 'react';
import { Field } from 'redux-form';
import History from './History';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../../react-common/components';

export default class AmazonForm extends Component {

  render() {
    const { props: { toggleHistory, storeName, showHistory, store } } = this;

    return (
      	<div className='input'>
            <input placeholder={`Search or Paste ${store.toUpperCase()} URL`} autoFocus autoComplete="off" spellCheck='true' onFocus={toggleHistory}/>
            <button type='submit'>
              	<Icon icon='Search'/>
            </button>
      	</div>
    );
  }
}
