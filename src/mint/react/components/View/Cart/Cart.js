// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { getStoreName, timeFromDate } from '../../../utils';
import { splitCartById } from '../../../reducers';

import { EmptyContainer } from '../../../containers';
import UserCart from './UserCart';
import MyCart from './MyCart';
import RewardCard from './RewardCard';

export default class Cart extends Component {
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    invoice: PropTypes.object,
    editId: PropTypes.string,
    removeItem: PropTypes.func,
    updateItem: PropTypes.func
  }

  render() {
    const { cart, user, invoice, editId, updateItem } = this.props,
      userCarts = splitCartById(this.props, user),
      myCart = userCarts.my,
      isLeader = user.id === cart.leader.id,
      achieveIndex = {8: { reqs: 8, discount: 70, color: 'red' }, 6: { reqs: 6, discount: 50, color: 'yellow'  }, 3: { reqs: 3, discount: 20, color: 'green' }};

    return (
      <table className='cart'>
        <thead>
          <MyCart myCart={myCart} {...this.props} {...this.state} achieveIndex={achieveIndex} isLeader={isLeader}/>
        </thead>
        <tbody>
          {
            userCarts.others.sort((a, b) => {
              a = new Date(a.createdAt);
              b = new Date(b.createdAt);
              return a>b ? -1 : a<b ? 1 : 0;
            }).map((userCart, index) => {
              let color = userCart.memberNumber > 2 ? ( userCart.memberNumber > 5 ? ( userCart.memberNumber > 7 ? 'red': 'yellow') : 'green') : '';
              let imageSrc = userCart.memberNumber > 2 ? ( userCart.memberNumber > 5 ? ( userCart.memberNumber > 7 ? '//storage.googleapis.com/kip-random/social/complete_3.png': '//storage.googleapis.com/kip-random/social/complete_2.png') : '//storage.googleapis.com/kip-random/social/complete_1.png') : '//storage.googleapis.com/kip-random/social/complete_1.png';

              if(achieveIndex[userCart.memberNumber]) {
                return (
                  <span className='double'>
                    <RewardCard 
                      title={`${achieveIndex[userCart.memberNumber].discount}% OFF`}
                      sub={`REWARD EARNED`}
                      imageSrc={imageSrc}
                      number={userCart.memberNumber}
                      classes={achieveIndex[userCart.memberNumber].color}/>
                    <UserCart key={userCart.id} index={index} userCart={userCart} {...this.props} {...this.state} achieveIndex={achieveIndex} isLeader={isLeader} color={color} imageSrc={imageSrc}/>
                  </span>
                )
              }

              return (
                <UserCart key={userCart.id} index={index} userCart={userCart} {...this.props} {...this.state} achieveIndex={achieveIndex} isLeader={isLeader} color={color} imageSrc={imageSrc}/>
              )
            })
          }
          <RewardCard 
            title={`${getStoreName(cart.store, cart.store_locale) ? getStoreName(cart.store, cart.store_locale).toUpperCase() : null} CART CREATED`}
            sub={`By ${user.name} ${timeFromDate(cart.createdAt)}`}
            imageSrc='https://storage.googleapis.com/kip-random/social/new_cart.png'
            classes='yellow'/>
        </tbody>
      </table>
    );
  }
}


          // <tr>
          //  { myCart.length ? null : ( cart.locked ? null : <EmptyContainer /> ) }
          // </tr>