import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '..';
import { getSearchHistory } from '../../utils';

export default class SearchHistory extends Component {
  render() {
    const { props: { filter } } = this,
          searchHistory = filter ? getSearchHistory(filter) : [];

    return (
      <ul className='searchHistory'>
        {
          _.map(searchHistory, (previousSearch, i) => {
            return (
              <li key={i} className='searchHistory__term'>{previousSearch}</li>
            )
          })
        }
      </ul>
    );
  }
}
