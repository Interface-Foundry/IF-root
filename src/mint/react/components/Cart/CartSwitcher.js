import React, { PropTypes, Component } from 'react';

export default class CartSwitcher extends Component {
  static propTypes = {
    carts: PropTypes.arrayOf(PropTypes.object)
  }

  render() {
    const { carts } = this.props;
    return (
      <div>
            Your Carts:
        <ul>
          {carts.map((cart, i)=><CartItem key={i} cart={cart}/>)}
        </ul>
      </div>
    );
  }
}

class CartItem extends Component {
  static propTypes = {
    cart: PropTypes.object.isRequired,
  }

  render() {
    const { cart } = this.props;
    const { id, items, leader } = cart;
    return (
      <li>
        <a className='cartswitcher__cart' href={`/cart/${id}`}>
          {id} by {leader.email_address} ({items.length} items)
        </a>
      </li>
    );
  }
}
