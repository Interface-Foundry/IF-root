// react/components/Feedback/Feedback.js

import React, { Component } from 'react';
import { Icon } from '..';

export default class Feedback extends Component {

  render() {
    return (
      <div className='feedback'>
        <h1>How was your exerience with Kip?</h1>
      	<ul>
      		<li className='col-4'><Icon icon='Happy'/><h3>Good</h3></li>
          <li className='col-4'><Icon icon='Neutral'/><h3>Okay</h3></li>
          <li className='col-4'><Icon icon='Sad'/><h3>Bad</h3></li>
      	</ul>
      </div>
    );
  }
}
