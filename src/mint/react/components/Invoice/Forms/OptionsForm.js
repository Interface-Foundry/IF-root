// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';


export default class ChangeInvoice extends Component {

  render() {
    return (
      <div className='forms__shipping'>
        <form>
          <div>
          <label>
            Name:
            <input type="text" name="name" />
          </label>
          </div>
          <label>
            Address:
            <input type="text" name="address" />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}
