// react/components/AmazonForm/SearchHistory.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';
import { getSearchHistory } from '../../utils';

export default class History extends Component {
  render() {
    const { props: { query, submitQuery, cart : { store = '', store_locale = '' } } } = this,
    history = query.length > 0 ? getSearchHistory(query) : [];

    return (
      <ul className='history'>
        {
          history.map((previousSearch, i) => {
            return (
              <li key={i} className='history__term'>
                <div className='history__term-icon'>
                  <Icon icon='Search'/>
                </div>
                <div className='history__term-query' onClick={(e) => {
                  submitQuery(previousSearch, store, store_locale);
                }}>
                  <p>{previousSearch}</p>
                </div>
              </li>
            );
          })
        }
      </ul>
    );
  }
}
