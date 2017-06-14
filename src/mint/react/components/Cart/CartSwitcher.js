// react/components/Cart/CartSwitcher.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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
        <hr/>
      </div>
    );
  }
}

class CartItem extends Component {
  static propTypes = {
    cart: PropTypes.object.isRequired
  }

  render() {
    const { cart } = this.props;
    const { id, items, leader } = cart;
    return (
      <li>
        <Link className='cartswitcher__cart' to={`/cart/${id}`}>
          {id} by {leader.name} ({items.length} items)
        </Link>
      </li>
    );
  }
}
