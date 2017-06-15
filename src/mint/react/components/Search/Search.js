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
    categories: PropTypes.array,
    submitQuery: PropTypes.func,
    updateQuery: PropTypes.func
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
    const { query, updateQuery } = this.props, { selectedQuery } = this.state,
      history = query.length > 0 ? getSearchHistory(query) : [];

    if (query) {
      switch (e.keyCode) {
      case 40:
        this.setState({ selectedQuery: history[selectedQuery + 1] ? selectedQuery + 1 : selectedQuery });
        break;
      case 38:
        this.setState({ selectedQuery: selectedQuery - 1 });
        break;
      case 13:
        e.preventDefault();
        if (selectedQuery > -1) {
          updateQuery(history[selectedQuery]);
          this._handleSubmit(history[selectedQuery]);
        } else {
          this._handleSubmit();
        }
        break;
      }
    }
  }

  render() {
    const { history, cart: { store = '' }, query, categories, updateQuery } = this.props, { selectedQuery } = this.state;

    return (
      <form onSubmit={::this._handleSubmit} className='search'>
        <button type='submit' className='submit'>
            <Icon icon='Search'/>
        </button>
        <input placeholder={`Search ${store.toUpperCase()} or paste URL`} value={query} autoFocus onChange={(e) => updateQuery(e.currentTarget.value)} autoComplete="off" spellCheck='true' onKeyDown={::this._handeKeyPress}/>
        <button className='cancel' type='button' disabled={!query} onClick={(e) => updateQuery('')}>
            <Delete />
        </button>
        { history ? <History {...this.props} selectedQuery={selectedQuery} /> : null }
      </form>
    );
  }
}
