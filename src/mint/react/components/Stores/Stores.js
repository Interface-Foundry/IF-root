// react/components/Stores/Stores.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Store from './Store';

export default class Stores extends Component {
  static propTypes = {
    stores: PropTypes.array,
    togglePopup: PropTypes.func,
    user: PropTypes.object
  }
  componentWillReceiveProps = ({ stores, togglePopup }) =>
    stores.length !== this.props.stores.length && !this.props.user.id ? togglePopup() : null;

  render = () => {
    const { stores = [] } = this.props;
    const normal = stores.filter(store => !store.global_direct),
      firstStore = [normal.shift() || []],
      suggested = firstStore.concat(stores.filter(store => store.global_direct)),
      otherStores = normal.slice() || [];
    console.log([...suggested.map(s => s.store_type), ...otherStores.map(s => s.store_type)])
    return (
      <section>
        <div className='cart_store'>
          <h3>Suggested For You</h3>
          <ul className='cart_store__list suggested'>
          {suggested.map(store =>
            <Store
              key={store.store_type}
              {...store}
            />
          )
        }
          </ul>
        </div>
        <div className='cart_store'>
          <h3>Other Stores</h3>
          <ul className='cart_store__list'>
            {otherStores.map(store =>
                <Store
                  key={store.store_type}
                  {...store}
                />
              )
            }
          </ul>
        </div>
      </section>
    );
  }
}