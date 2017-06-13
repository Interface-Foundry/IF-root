// react/components/CartStore/CartStore.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Stores extends Component {

  componentWillReceiveProps(nextProps) {
    const { stores, _toggleLoginScreen } = this.props;

    if (stores.length !== nextProps.stores.length && !nextProps.user.id) {
      _toggleLoginScreen();
    }
  }

  render() {
    const { stores, history: { push } } = this.props;
    return (
      <ul className="stores">
        {
        	stores.map(store => 
        		<li>
				      <a href={`/newcart/${store.store_type}`}  key={store.store_type} className='store'>
			          <div className='store__details'>
			            <div className='store__image image' style={{backgroundImage:`url(${store.store_img})`}}/>
			            <h4 className='store__name'> { store.store_name } </h4>
			            <p className='store__domain'> { store.store_domain } </p>
			          </div>
			          <div className='store__select'>
			            Choose
			          </div>
				      </a>
			      </li>
          )
        }
      </ul>
    );
  }
}
