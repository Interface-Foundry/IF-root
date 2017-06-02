// react/components/AmazonForm/History.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon } from '../../../../react-common/components';
import { getSearchHistory } from '../../../utils';

export default class History extends Component {
  static propTypes = {
    filter: PropTypes.string,
    handleSubmit: PropTypes.func,
    onChange: PropTypes.func
  }

  render() {
    const { props: { filter, handleSubmit, onChange } } = this,
    history = filter.length > 0 ? getSearchHistory(filter) : [];

    return (
      <ul className='History'>
        {
          history.map((previousSearch, i) => {
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
