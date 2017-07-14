// react/components/Search/Search.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../react-common/components';
import { Delete } from '../../../react-common/kipsvg';
import { getSearchHistory } from '../../utils';

import History from './History';

export default class Search extends Component {

  static propTypes = {
    cart: PropTypes.object,
    query: PropTypes.string,
    submitQuery: PropTypes.func,
    updateQuery: PropTypes.func,
    showHistory: PropTypes.bool,
    history: PropTypes.object,
    categories: PropTypes.array,
    toggleHistory: PropTypes.func
  }

  state = {
    selectedQuery: -1
  }

  _submitSearch(search) {
    const { cart: { store = '', store_locale = '' }, submitQuery } = this.props;
    this.setState({ selectedQuery: -1 });
    console.log({ search, store, store_locale })
    submitQuery(search, store, store_locale);
  }

  _processSearch = (e) => {
    const { query, updateQuery, categories } = this.props, { selectedQuery } = this.state,
      history = query.length > 0 ? getSearchHistory(query) : [],
      suggestedCategories = history.length > 0 ? categories : [];

    console.log({ e, query, combined, })
    const combined = [...history, ...suggestedCategories];
    e.preventDefault();
    if (selectedQuery > -1) {
      if (combined[selectedQuery].machineName) {
        updateQuery(combined[selectedQuery].humanName);
        this._submitSearch(combined[selectedQuery].machineName);
      } else {
        updateQuery(combined[selectedQuery]);
        this._submitSearch(combined[selectedQuery]);
      }
    } else {
      this._submitSearch(query);
    }
  }

  _handeKeyPress(e) {
    const { query, categories } = this.props, { selectedQuery } = this.state,
      history = query.length > 0 ? getSearchHistory(query).slice(0, 5) : [],
      suggestedCategories = history.length > 0 ? categories.slice(0, 5) : [];

    const combined = [...history, ...suggestedCategories];

    if (query) {
      switch (e.keyCode) {
      case 40:
        this.setState({ selectedQuery: combined[selectedQuery + 1] ? selectedQuery + 1 : selectedQuery });
        break;
      case 38:
        this.setState({ selectedQuery: selectedQuery - 1 });
        break;
      case 13:
        ::this._processSearch(e);
        break;
      }
    }
  }

  render() {
    const { showHistory, toggleHistory, cart: { store = '' }, query, updateQuery } = this.props, { selectedQuery } = this.state;
    return (
      <form onSubmit={::this._processSearch} className='search'>
        <button type='submit' className='submit'>
            <Icon icon='Search'/>
        </button>
        <input 
          onFocus={()=>toggleHistory(true)} 
          onBlur={()=>toggleHistory(false)} 
          placeholder={store.length > 0 ? `Search ${store.split(' ').map((w = ' ') => w.replace(w[0], w[0].toUpperCase())).join(' ')} or Paste URL` : 'Search or Paste URL'} 
          value={query} 
          onChange={(e) => updateQuery(e.currentTarget.value)} 
          autoComplete="off" 
          spellCheck='true' 
          onKeyDown={::this._handeKeyPress}
          ref={(searchInput) => this.searchInput = searchInput}
          />
        <button className='cancel' type='button' disabled={!query.length} onClick={(e) => {updateQuery(''); this.searchInput.focus();}}>
            <Delete />
        </button>
        { showHistory ? <History {...this.props} selectedQuery={selectedQuery} /> : null }
      </form>
    );
  }
}
