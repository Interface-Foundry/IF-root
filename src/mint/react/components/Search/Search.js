// react/components/modal/Search/Search.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../react-common/components';
import { Delete } from '../../../react-common/kipsvg';
import { getSearchHistory } from '../../utils';

import History from './History';

export default class Input extends Component {

  static propTypes = {
    cart: PropTypes.object,
    query: PropTypes.string,
    submitQuery: PropTypes.func,
    updateQuery: PropTypes.func,
    history: PropTypes.bool
  }

  state = {
    selectedQuery: -1
  }

  _handleSubmit(previousQuery) {
    const { cart: { store = '', store_locale = '' }, query, submitQuery } = this.props;

    this.setState({ selectedQuery: -1 });
    submitQuery(previousQuery || query, store, store_locale);
  }

  _handeKeyPress(e) {
    const { query, updateQuery, categories } = this.props, { selectedQuery } = this.state,
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
        e.preventDefault();
        if (selectedQuery > -1) {
          if(combined[selectedQuery].machineName) {
            updateQuery(combined[selectedQuery].humanName);
            this._handleSubmit(combined[selectedQuery].machineName);
          } else {
            updateQuery(combined[selectedQuery]);
            this._handleSubmit(combined[selectedQuery]);
          }
        } else {
          this._handleSubmit();
        }
        break;
      }
    }
  }

  render() {
    const { history, cart: { store = '' }, query, updateQuery } = this.props, { selectedQuery } = this.state;
    return (
      <form onSubmit={::this._handleSubmit} className='search'>
        <button type='submit' className='submit'>
            <Icon icon='Search'/>
        </button>
        <input placeholder={store.length > 0 ? `Search ${store.split(' ').map((w = ' ') => w.replace(w[0], w[0].toUpperCase())).join(' ')} or Paste URL` : ''} value={query} autoFocus onChange={(e) => updateQuery(e.currentTarget.value)} autoComplete="off" spellCheck='true' onKeyDown={::this._handeKeyPress}/>
        <button className='cancel' type='button' disabled={!query} onClick={(e) => updateQuery('')}>
            <Delete />
        </button>
        { history ? <History {...this.props} selectedQuery={selectedQuery} /> : null }
      </form>
    );
  }
}
