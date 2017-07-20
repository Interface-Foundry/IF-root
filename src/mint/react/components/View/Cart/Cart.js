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

  _getCompleteImage(memberNumber) {
    return memberNumber > 3 ? ( memberNumber > 6 ? ( memberNumber > 8 ? '//storage.googleapis.com/kip-random/social/complete_3.png': '//storage.googleapis.com/kip-random/social/complete_3.png') : '//storage.googleapis.com/kip-random/social/complete_2.png') : '//storage.googleapis.com/kip-random/social/complete_1.png';
  }

  _getIncompleteImage(memberNumber) {
    return memberNumber > 3 ? ( memberNumber > 6 ? ( memberNumber > 8 ? '//storage.googleapis.com/kip-random/social/inprogress_3.png': '//storage.googleapis.com/kip-random/social/inprogress_3.png') : '//storage.googleapis.com/kip-random/social/inprogress_2.png') : '//storage.googleapis.com/kip-random/social/inprogress_1.png';
  }

  render() {
    const { cart, user, invoice, editId, updateItem } = this.props,
      { _getCompleteImage, _getIncompleteImage } = this,
      userCarts = splitCartById(this.props, user),
      myCart = userCarts.my,
      isLeader = user.id === cart.leader.id,
      lastAward = userCarts.others.length > 3 ? ( userCarts.others.length > 6 ? ( userCarts.others.length > 10 ?  10 : 6 ) : 3 ) : 0,
      achieveIndex = {10: { reqs: 10, discount: 70, color: 'red' }, 6: { reqs: 6, discount: 50, color: 'yellow'  }, 3: { reqs: 3, discount: 20, color: 'green' }};

    return (
      <table className='cart'>
        <thead>
          <MyCart myCart={myCart} {...this.props} {...this.state} achieveIndex={achieveIndex} isLeader={isLeader}/>
        </thead>
        <tbody>
          {
            userCarts.others.map((userCart, index) => {
              let memberNumber = userCarts.others.length - index;
              const color = memberNumber > 2 ? ( memberNumber > 5 ? ( memberNumber > 7 ? 'red': 'yellow') : 'green') : '';
              const imageSrc = memberNumber <= lastAward ? _getCompleteImage(memberNumber) :  _getIncompleteImage(memberNumber);

              if(achieveIndex[memberNumber]) {
                return (
                  <tr className={`double ${achieveIndex[memberNumber].color}`} key={userCart.id}>
                    <RewardCard 
                      title={`${achieveIndex[memberNumber].discount}% OFF`}
                      sub={`REWARD EARNED`}
                      imageSrc={imageSrc}
                      number={memberNumber}
                      classes={achieveIndex[memberNumber].color}/>
                    <UserCart index={index} userCart={userCart} {...this.props} memberNumber={'✓'} {...this.state} achieveIndex={achieveIndex} isLeader={isLeader} color={`gradient ${color}`} imageSrc={imageSrc}/>
                  </tr>
                )
              }

              if (memberNumber < lastAward) memberNumber = '✓'
              return (
                <tr key={userCart.id}>
                  <UserCart key={userCart.id} index={index} memberNumber={memberNumber} userCart={userCart} {...this.props} {...this.state} achieveIndex={achieveIndex} isLeader={isLeader} color={color} imageSrc={imageSrc}/>
                </tr>
              )
            })
          }
          <tr className={`double yellow bottom`}>
            <RewardCard 
              title={`${getStoreName(cart.store, cart.store_locale) ? getStoreName(cart.store, cart.store_locale).toUpperCase() : null} CART CREATED`}
              sub={`By ${user.name} ${timeFromDate(cart.createdAt)}`}
              imageSrc='https://storage.googleapis.com/kip-random/social/new_cart.png'
              classes='yellow'/>
          </tr>
        </tbody>
      </table>
    );
  }
}


          // <tr>
          //  { myCart.length ? null : ( cart.locked ? null : <EmptyContainer /> ) }
          // </tr>