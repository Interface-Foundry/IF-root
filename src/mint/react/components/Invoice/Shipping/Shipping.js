// react/components/Invoice/Invoice.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

const addressDummy = [
    {
        name: 'Derp Address 1',
        streetAddress: '410 Derp street apt 1D',
        city: 'Derponia',
        state: 'DP',
        zip: 36020,
        country: 'United Derps'
    },
    {
        name: 'Derp Address 2',
        streetAddress: '420 Derp street apt 2D',
        city: 'Derponia',
        state: 'DP',
        zip: 36020,
        country: 'United Derps'
    },
    {
        name: 'Derp Address 3',
        streetAddress: '430 Derp street apt 3D',
        city: 'Derponia',
        state: 'DP',
        zip: 36020,
        country: 'United Derps'
    }
]

export default class Shipping extends Component {

    state = {
        selectedIndex: null
    }

    render() {
      	const { selectedAccordion, selectAccordion } = this.props,
                { selectedIndex } = this.state;

        return (
        	<div className='shipping accordion'>
        		<nav onClick={() => selectAccordion('shipping')}>
        			<h3>1. Shipping address</h3>
                {
                  selectedIndex !== null && !selectedAccordion.includes('shipping') ? <div className='text'> 
                      <p>{addressDummy[selectedIndex].name}</p>
                      <p>{addressDummy[selectedIndex].streetAddress}</p>
                      <p>{addressDummy[selectedIndex].city}, {addressDummy[selectedIndex].state}, {addressDummy[selectedIndex].zip}</p>
                      <span>change</span>
                  </div> : null
                }
        		</nav>
        		{
        			selectedAccordion.includes('shipping') ? <div> 
        				<nav>
        					<h4>Your addresses</h4>
        				</nav>
                  <ul>
                      {
                          addressDummy.map((address, i) => (
                              <li key={i} className={selectedIndex === i ? 'selected' : ''} onClick={() => this.setState({selectedIndex: i})}>
                                  <div className='circle'/>
                                  <div className='text'>
                                      <h4>{address.name}</h4>
                                      <p>{address.streetAddress}, {address.city}, {address.state}, {address.zip}, {address.country}</p>
                                      <span>edit</span>
                                  </div>
                              </li>
                          ))
                      }
                  </ul>
                  <button onClick={() => selectAccordion('shipping form')}>+ add address</button>
    	    		</div> : null
        		}
        	</div>
        );
    }
}
