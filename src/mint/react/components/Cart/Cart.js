import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CartItem from './CartItem';
import { AddAmazonItemContainer, DealsContainer } from '../../containers';

export default class Cart extends Component {
  static propTypes = {
    fetchDeals: PropTypes.func.isRequired,
    cart_id: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    leader: PropTypes.object,
    items: PropTypes.object.isRequired,
    addingItem: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    user_account: PropTypes.object
  }

  componentWillMount() {
    const { fetchDeals } = this.props;
    fetchDeals();
  }

  componentWillReceiveProps(nextProps) {
    const { history: { replace }, cart_id } = this.props, { leader, addingItem, user_account } = nextProps,
      cartId = cart_id || nextProps.cart_id;

    if (cartId) {
      if (!user_account.id && !leader) {
        replace(`/cart/${cartId}/m/signin`);
      } else if (!!leader && !addingItem && this.props.addingItem !== addingItem && !!user_account.id) {
        replace(`/cart/${cartId}/`);
      }
    }
  }

  render() {
    const { items, leader, members, user_account, history: { replace } } = this.props,
      hasItems = items.quantity > 0,
      isLeader = !!user_account.id && !!leader && (leader.id === user_account.id);

    return (
      <div className='cart'>
        <div className='cart__add'>
          <AddAmazonItemContainer replace={replace} members={members}/>
        </div>
        {!!user_account.id ? <DealsContainer isDropdown={false}/> : null}
        <div className='cart__title'>
          <h4>{ hasItems ? `${items.quantity} items in Group Cart` : 'Group Shopping Cart' }</h4>
        </div>
        <div className='cart__items'>
          <MyItems {...this.props} items={items.my} />
          <OtherItems {...this.props} items={items.others} startIndex={items.my.length} isLeader={isLeader} />
        </div>
      </div>
    );
  }
}

class MyItems extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired
  }

  render() {
    const { props, props: { items } } = this;
    
    return (
      <ul>
        <div className='cart__items__title'>Your Items</div>
        {
          items.length 
          ? items.map((item, i) => <CartItem key={i} itemNumber={i} isOwner={true} item={item} {...props} />) 
          : <EmptyCart />
        }
      </ul>
    );
  }
}

class OtherItems extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    isLeader: PropTypes.bool.isRequired,
    startIndex: PropTypes.number
  }

  render() {
    const { props, props: { items, isLeader, startIndex } } = this;
    return (
      <ul>
        <div className='cart__items__title'>Everyone's Items</div>
        {
          items.length 
          ? items.map((item, i) => <CartItem key={i} itemNumber={i + startIndex} isOwner={isLeader} item={item} {...props} />) 
          : <EmptyCart />
        }
      </ul>
    );
  }
}

class EmptyCart extends Component {
  render() {
    return (
      <li className='cart__items-empty'>
        <div className='image' style={{backgroundImage:'url(http://tidepools.co/kip/head_smaller.png)'}}/>
        <h4>Huh. Nothing to see here</h4>
      </li>
    );
  }
}
