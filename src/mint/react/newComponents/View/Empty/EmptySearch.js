// mint/react/components/View/Empty/Empty.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Down } from '../../../../react-common/kipsvg';

export default class EmptySearch extends Component {

  static propTypes = {
    cart: PropTypes.object,
    categories: PropTypes.array,
    submitQuery: PropTypes.func,
    updateQuery: PropTypes.func
  }

  render() {
  	const { categories, submitQuery, updateQuery, cart} = this.props;
  	
    return (
      <div className='empty results'>
        <Down/>
        <h4><span>Hi there!</span><br></br> Search above or tap one of our suggested categories below to get started 😊</h4>
        {
        	categories.map((c) => (
        		<h5 onClick={() => {
              updateQuery(c.humanName);
              submitQuery(c.humanName, cart.store, cart.store_locale);
            }}>{c.humanName}</h5>
        	))
        }
      </div>
    );
  }
}
