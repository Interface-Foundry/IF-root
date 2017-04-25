// react/components/AmazonForm/SearchHistory.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '..';
import { getSearchHistory } from '../../utils';

export default class SearchHistory extends Component {
  static propTypes = {
    filter: PropTypes.array,
    handleSubmit: PropTypes.func,
    onChange: PropTypes.func
  }

  render() {
    const { props: { filter, handleSubmit, onChange } } = this,
    searchHistory = filter.length > 0 ? getSearchHistory(filter) : [];

    return (
      <ul className='searchHistory'>
        {
          _.map(searchHistory, (previousSearch, i) => {
            return (
              <li key={i} className='searchHistory__term'>
                <div className='searchHistory__term-icon'>
                  <Icon icon='Search'/>
                </div>
                <div className='searchHistory__term-query' onClick={(e) => {
                  onChange(previousSearch);
                  setTimeout(() => {
                    handleSubmit();
                  }, 100);
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
