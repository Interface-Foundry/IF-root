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
    categories: PropTypes.array,
    cart: PropTypes.object
  }

  render() {
    const { props: { query, categories, selectedQuery, submitQuery, updateQuery, cart: { store = '', store_locale = '' } } } = this,
    history = query.length > 0 ? getSearchHistory(query).slice(0, 5) : [],
      suggestedCategories =  categories.slice(0, 5);
    return (
      <span className='history'>
        <ul className='previous'>
          {
            history.map((previousSearch, i) => {
              return (
                <li key={i} className={`history__term ${i === selectedQuery ? 'selected' : ''}`}>
                  <div className='history__term-icon'>
                    <Icon icon='Search'/>
                  </div>
                  <div className='history__term-query' onMouseDown={(e) => {
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
        <ul className='categories'>
          { suggestedCategories.length > 0 ? <span>Suggested --</span> : null }
          {
            suggestedCategories.map((category, i) => {
              return (
                <li key={i} className={`history__term ${i === ( selectedQuery - history.length ) ? 'selected' : ''}`}>
                  <div className='history__term-icon'>
                    <Icon icon='Eye'/>
                  </div>
                  <div className='history__term-query' onMouseDown={(e) => {
                    updateQuery(category.humanName);
                    submitQuery(category.machineName, store, store_locale);
                  }}>
                    <p>{category.humanName}</p>
                  </div>
                </li>
              );
            })
          }
        </ul>
      </span>
    );
  }
}
