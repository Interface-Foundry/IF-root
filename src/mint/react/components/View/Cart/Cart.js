// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { getStoreName, timeFromDate } from '../../../utils';
import { splitCartById } from '../../../reducers';

import { EmptyContainer } from '../../../containers';
import UserCart from './UserCart';
import MyCart from './MyCart';
import RewardCard from './RewardCard';

// Youtube embed
// <iframe width="1280" height="720" src="https://www.youtube.com/embed/EmwO1_IMrmY?ecver=1" frameborder="0" allowfullscreen></iframe>

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
    return memberNumber > 3 ? ( memberNumber > 5 ? ( memberNumber > 8 ? '//storage.googleapis.com/kip-random/social/complete_3.png': '//storage.googleapis.com/kip-random/social/complete_3.png') : '//storage.googleapis.com/kip-random/social/complete_2.png') : '//storage.googleapis.com/kip-random/social/complete_1.png';
  }

  _getIncompleteImage(memberNumber) {
    return `//storage.googleapis.com/kip-random/social/progress/inprogress_${memberNumber}.png`
  }

  _getLockedImage(memberNumber) {
    return memberNumber > 3 ? ( memberNumber > 5 ? ( memberNumber > 8 ? '//storage.googleapis.com/kip-random/social/locked_3.png': '//storage.googleapis.com/kip-random/social/locked_3.png') : '//storage.googleapis.com/kip-random/social/locked_2.png') : '//storage.googleapis.com/kip-random/social/locked_1.png';
  }

  _getColor(memberNumber) {
    return memberNumber > 3 ? ( memberNumber > 5 ? ( memberNumber > 8 ? 'four': 'three') : 'two') : 'one';
  }

  render() {
    const { cart, user, invoice, editId, updateItem, achievements } = this.props,
      { _getCompleteImage, _getIncompleteImage, _getLockedImage, _getColor } = this,
      userCarts = splitCartById(this.props, user),
      myCart = userCarts.my,
      isLeader = user.id === cart.leader.id,
      lastAward = userCarts.others.length > 2 ? ( userCarts.others.length > 4 ? ( userCarts.others.length > 7 ? ( userCarts.others.length > 11 ? 12 : 8 ) : 5 ) : 3 ) : 0,
      nextAward = userCarts.others.length >= 3 ? ( userCarts.others.length >= 5 ? ( userCarts.others.length >= 8 ?  ( userCarts.others.length > 12 ? 20 : 12 )  : 8 ) : 5 ) : 3;

    if(userCarts.others.length === 0) {
      userCarts.others.push({
        createdAt: user.createdAt,
        email_address: user.email_address,
        id: user.id + '_temp',
        items: [],
        name: user.name,
        updateAt: user.updateAt
      })
    }
    
    return (
      <table className='cart'>
        <thead>
          <MyCart myCart={myCart} {...this.props} {...this.state} achievements={achievements} isLeader={isLeader}/>
        </thead>
        <tbody>
          <tr className={`next grey`}>
            <RewardCard 
              title={achievements[nextAward].reward}
              sub={`+${achievements[nextAward].reqs - userCarts.others.length} MORE ${achievements[nextAward].reqs - userCarts.others.length === 1 ? 'PERSON' : 'PEOPLE' }`}
              imageSrc={_getLockedImage(userCarts.others.length)}
              classes='grey gradient'
              cart={cart}
              share={true}/>
          </tr>
          {
            userCarts.others.map((userCart, index) => {
              let memberNumber = userCarts.others.length - index;
              const color = _getColor(memberNumber);
              const imageSrc = memberNumber <= lastAward ? _getCompleteImage(memberNumber) :  _getIncompleteImage(memberNumber);

              if(achievements[memberNumber]) {
                return (
                  <tr className={`double ${achievements[memberNumber].color}`} key={userCart.id}>
                    <RewardCard 
                      title={`${achievements[memberNumber].reqs}pp Joined!`}
                      sub={achievements[memberNumber].reward}
                      imageSrc={imageSrc}
                      number={memberNumber}
                      classes={achievements[memberNumber].color}/>
                    <UserCart index={index} userCart={userCart} {...this.props} memberNumber={'icon'} {...this.state} achievements={achievements} isLeader={isLeader} color={`gradient ${color}`} imageSrc={imageSrc}/>
                  </tr>
                )
              }

              if (memberNumber < lastAward) memberNumber = 'icon'
              return (
                <tr key={userCart.id}>
                  <UserCart key={userCart.id} index={index} memberNumber={memberNumber} userCart={userCart} {...this.props} {...this.state} achievements={achievements} isLeader={isLeader} color={color} imageSrc={imageSrc}/>
                </tr>
              )
            })
          }
          <tr className={`double yellow bottom`}>
            <RewardCard 
              title={`${getStoreName(cart.store, cart.store_locale) ? getStoreName(cart.store, cart.store_locale).toUpperCase() : null} CART CREATED`}
              sub={`By ${cart.leader.name} ${timeFromDate(cart.createdAt)}`}
              imageSrc='https://storage.googleapis.com/kip-random/social/new_cart.png'
              classes='one'/>
          </tr>
        </tbody>
      </table>
    );
  }
}


          // <tr>
          //  { myCart.length ? null : ( cart.locked ? null : <EmptyContainer /> ) }
          // </tr>