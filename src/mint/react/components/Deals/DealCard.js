import React, { Component, PropTypes } from 'react';
import DropdownItem from './DropdownItem';
import Card from './Card';

export default class DealCard extends Component {

  static propTypes = {
    isDropdown: PropTypes.bool
  }

  render() {
    const { props, props: { isDropdown } } = this;
    const Deal = isDropdown ? DropdownItem : Card;
    return <Deal {...props} />;
  }
}
