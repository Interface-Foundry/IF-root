// react/components/Stores/Store.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Store extends Component {
  static propTypes = {
    store_img: PropTypes.string,
    store_type: PropTypes.string,
    store_name: PropTypes.string,
    store_domain: PropTypes.string
  }
  render() {
    const {
      store_img: img,
      store_type: type,
      store_name: name,
      store_domain: domain
    } = this.props;

    return (
      <a href={`/newcart/${type}`}  key={type}>
        <div className='cart__choice'>
          <div className='choice__details'>
            <div className='choice__image image' style={{backgroundImage:`url(${img})`}}/>
            <span className='choice__name'> { name } </span>
            <span className='choice__domain'> { domain } </span>
          </div>
          <div className='choice__select'>
            Choose
          </div>
        </div>
      </a>
    );
  }
}
