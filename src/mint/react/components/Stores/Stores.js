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
  componentWillReceiveProps(nextProps) {
    const { stores, togglePopup } = this.props;

    if (stores.length !== nextProps.stores.length && !nextProps.user.id) {
      togglePopup();
    }
  }

  render() {
    const { stores = [] } = this.props;
    const globalDirect = process.env.NODE_ENV !== 'production' ? stores.filter(store => store.global_direct) : [],
      normal = stores.filter(store => !store.global_direct),
      firstStore = [normal.shift() || []],
      suggested = firstStore.concat(globalDirect),
      otherStores = normal.slice() || [];

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