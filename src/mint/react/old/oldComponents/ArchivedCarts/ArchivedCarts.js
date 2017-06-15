import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router-dom';

export default class ArchivedCarts extends Component {
  static propTypes = {
    archivedCarts: PropTypes.array,
    fetchAllCarts: PropTypes.func
  }

  componentWillMount() {
    const { archivedCarts, fetchAllCarts } = this.props;
    if (!archivedCarts) {
      fetchAllCarts();
    }
  }

  render() {
    const { archivedCarts } = this.props;
    return (
      <ul className='archivedCarts'>
        {
        archivedCarts.map(cart =>
          <li key={cart.id}> 
            <Link className='archivedCart' to={`/cart/${cart.id}`}>
              <div className='image' style={{backgroundImage:`url(${cart.thumbnail_url})`}}/>
              <div className='cartInfo'>
                <p className='cartName'>{cart.name}</p>
                <p className='cartStore'>{cart.store} ({cart.store_locale})</p>
                <p className='cartItemsCount'>{cart.items.length} Item{cart.items.length === 1 ? '' : 's'}</p>
                <p className='cartMembersCount'>{cart.members.length} Member{cart.members.length === 1 ? '' : 's'}</p>
              </div>
            </Link>
          </li>)
        }
      </ul>
    );
  }
}
