import React, { PropTypes, Component } from 'react';

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render() {
    const { item } = this.props;
    return (
      <li>
        {item.id}: <a href={item.original_link}>{item.name}</a>
        <br/>
        {item.descrip}
        <br/>
        {item.email}, Quantity: {item.quantity}, ${item.price}, {item.paid ? 'Paid' : 'Unpaid'}, Total: ${item.total}
      </li>);
  }
}
