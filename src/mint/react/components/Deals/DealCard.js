import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DropdownItem from './DropdownItem';
import Card from './Card';

export default class DealCard extends Component {

  static propTypes = {
    isDropdown: PropTypes.bool,
    asin: PropTypes.string.isRequired,
    cart_id: PropTypes.string,
    index: PropTypes.number.isRequired
  }

  render() {
    const { props, props: { isDropdown, cart_id, index, asin, selectDeal } } = this;
    const Deal = isDropdown ? DropdownItem : Card;
    return (
      <Link to={`/cart/${cart_id}/m/deal/${index}/${asin}`}>
        <Deal {...props} />
      </Link>);
  }
}
