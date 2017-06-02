
import React, { Component } from 'react';
import { Icon } from '../../../react-common/components';

import History from './History';

export default class Input extends Component {

  render() {
    const { history, cart : { store = '', store_locale = '' }, query, toggleHistory, updateQuery, submitQuery } = this.props;

    return (
      	<form onSubmit={(e) => {
          e.preventDefault();
          submitQuery(query, store, store_locale)
        }} className='search'>
            <input placeholder={`Search or Paste ${store.toUpperCase()} URL`} value={query} autoFocus onChange={(e) => updateQuery(e.currentTarget.value)} autoComplete="off" spellCheck='true'/>
            <button type='submit'>
              	<Icon icon='Search'/>
            </button>
            { history ? <History {...this.props} /> : null }
      	</form>
    );
  }
}
