// react/components/AmazonForm/SearchHistory.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';
import { getSearchHistory } from '../../utils';

export default class History extends Component {
  static propTypes = {
    query: PropTypes.string,
    selectedQuery: PropTypes.number,
    submitQuery: PropTypes.func,
    updateQuery: PropTypes.func,
    cart: PropTypes.object
  }

  render() {
    const { props: { query, selectedQuery, submitQuery, updateQuery, cart: { store = '', store_locale = '' } } } = this,
    history = query.length > 0 ? getSearchHistory(query) : [];

    return (
      <ul className='history'>
        {
          history.map((previousSearch, i) => {
            return (
              <li key={i} className={`history__term ${i === selectedQuery ? 'selected' : ''}`}>
                <div className='history__term-icon'>
                  <Icon icon='Search'/>
                </div>
                <div className='history__term-query' onClick={(e) => {
                  updateQuery(previousSearch);
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
