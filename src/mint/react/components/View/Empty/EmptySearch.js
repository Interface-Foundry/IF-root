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
    const { categories, submitQuery, updateQuery, cart } = this.props;

    return (
      <td className='empty results'>
        <div className='text'>
          <h2>
            <b>Hi! 😊&nbsp;Not sure what your looking for? </b>
          </h2>
          <p>
            Search above or tap one of our suggested categories below to get started
          </p>
          <span>
            {/*Learn More*/ /* until we actually have something here */ } 
          </span>
        </div>
         <div className='suggested'>
            {
              categories.map((c, i) => (
                <h5 key={i} onClick={() => {
                  updateQuery(c.humanName);
                  submitQuery(c.machineName, cart.store, cart.store_locale);
                }}>{c.humanName}</h5>
              ))
            }
          </div>
      </td>
    );
  }
}
