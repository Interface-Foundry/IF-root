// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class CartReview extends Component {

  render() {
  	const { selectedAccordion, selectAccordion } = this.props;

    return (
    	<div className='review accordion'>
    		<nav onClick={() => selectAccordion('review')}>
    			<h3>3. Items and shipping</h3>
    		</nav>
    		{
    			selectedAccordion === 'review' ? <div> 

	    		</div> : null
    		}
    	</div>
    );
  }
}
