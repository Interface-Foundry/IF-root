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
      <div className='empty results'>
        <div className='text'>
          <h2>
            Hi! 😊&nbsp;&nbsp;Want to see wht we have on offer? <br/> 
          </h2>
          <p>
            Want to get Started? <br/> Choose a suggested category
          </p>
          <span>
            Learn More
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
      </div>
    );
  }
}
