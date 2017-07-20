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
            userCarts.others.map((userCart, index) => {
              const memberNumber = userCarts.others.length - index;
              const color = memberNumber > 2 ? ( memberNumber > 5 ? ( memberNumber > 7 ? 'red': 'yellow') : 'green') : '';
              const imageSrc = memberNumber > 3 ? ( memberNumber > 6 ? ( memberNumber > 8 ? '//storage.googleapis.com/kip-random/social/complete_3.png': '//storage.googleapis.com/kip-random/social/complete_3.png') : '//storage.googleapis.com/kip-random/social/complete_2.png') : '//storage.googleapis.com/kip-random/social/complete_1.png';

              if(achieveIndex[memberNumber]) {
                const rewardSrc = memberNumber > 2 ? ( memberNumber > 5 ? ( memberNumber > 7 ? '//storage.googleapis.com/kip-random/social/complete_3.png': '//storage.googleapis.com/kip-random/social/complete_3.png') : '//storage.googleapis.com/kip-random/social/complete_2.png') : '//storage.googleapis.com/kip-random/social/complete_1.png';
                return (
                  <div className='double' key={userCart.id} >
                    <RewardCard 
                      title={`${achieveIndex[memberNumber].discount}% OFF`}
                      sub={`REWARD EARNED`}
                      imageSrc={rewardSrc}
                      number={memberNumber}
                      classes={achieveIndex[memberNumber].color}/>
                    <UserCart index={index} userCart={userCart} {...this.props} memberNumber={memberNumber} {...this.state} achieveIndex={achieveIndex} isLeader={isLeader} color={color} imageSrc={imageSrc}/>
                  </div>
                )
              }

              return (
                <UserCart key={userCart.id} index={index} memberNumber={memberNumber} userCart={userCart} {...this.props} {...this.state} achieveIndex={achieveIndex} isLeader={isLeader} color={color} imageSrc={imageSrc}/>
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