// mint/react/components/empty/empty.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import moment from 'moment';


export default class empty extends Component {

  render() {

    return (
      <table className='empty'>
        <tbody>
          <tr>
            <td colSpan='100%'>
              <div className='transparent'>
                <h4><span>Hello!</span><br></br>Looks like you haven't added any items yet. Search above to get started, or invite others to add to the cart by tapping the Share button below 😊</h4>
                <div className='image' style={{backgroundImage:'url(//storage.googleapis.com/kip-random/many_kips/presents_stare_sk.svg)'}}/>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}


