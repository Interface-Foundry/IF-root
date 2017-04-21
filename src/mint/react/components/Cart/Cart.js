import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CartItem from './CartItem';
import { AddAmazonItemContainer, DealsContainer } from '../../containers';
import { Icon } from '..';
import { calculateItemTotal, displayCost } from '../../utils';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

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
    user_account: PropTypes.object,
    locked: PropTypes.bool,
    updateCart: PropTypes.func,
    currentCart: PropTypes.object
  }

  state = {
    removeDeal: false
  }

  componentWillMount() {
    const { fetchDeals, deals } = this.props;

    if(deals.length === 0) {
      fetchDeals();
    }
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
    
    if(items.quantity < nextProps.items.quantity && items.quantity !== 0) {
      this._runAnimation('✓ Item Added to Kip Cart')
    } else if (items.quantity > nextProps.items.quantity && items.quantity !== 0) {
      this._runAnimation('× Item Removed from Kip Cart')
    }
  }

  render() {
    const { items, leader, members, user_account, history, history: { replace }, locked, updateCart, currentCart, position } = this.props,
      hasItems = items.quantity > 0,
      isLeader = !!user_account.id && !!leader && (leader.id === user_account.id);

    return (
      <div className='cart'>
        {
          locked 
          ? <div className='cart__locked'>
              <div className='cart__locked__text'>
                <Icon icon='Locked'/>
                <p>Locked</p>
              </div>
              {
                leader.id === user_account.id ? <button onClick={() => {
                  updateCart({
                    ...currentCart, 
                    locked: !currentCart.locked
                  });
                }}>
                  Unlock
                </button> : null
              }
            </div> 
          : <span>
              <div className='cart__add'>
                <AddAmazonItemContainer replace={replace} members={members}/>
              </div>
              {!!user_account.id ? <DealsContainer isDropdown={false}/> : null}
            </span>
        }
        <div className='cart__title'>
          <h4>{ hasItems ? `${items.quantity} items in Group Cart` : 'Group Shopping Cart' }</h4>
        </div>
        <div className='cart__items'>
          <MyItems {...this.props} items={items.my} />
          {
            _.map(items.others, (value, key, index) => {
              return (<OtherItems {...this.props} key={key} title={key} items={value} startIndex={items.my.length} isLeader={isLeader} />);
            })
          }
        </div>
      </div>
    );
  }
}

class MyItems extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired
  }

  renderList() {
    const { props, props: { items } } = this,
      cartItems = items.reverse().map((item, i) => <CartItem key={item.id} itemNumber={i} isOwner={true} item={item} {...props} />);

    return (
      <CSSTransitionGroup
        transitionName="cartItem"
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}>
        {cartItems}
      </CSSTransitionGroup>
    )
  }

  render() {
    const { props, props: { items } } = this,
    total = calculateItemTotal(items);

    return (
      <ul>
        <div className='cart__items__title'>Your Items</div>
        <div className='cart__items__container'>
          {
            items.length 
            ? this.renderList() 
            : <EmptyCart key="empty"/>
          }
        </div>
        <h3>Total: <span>{displayCost(total)}</span></h3>
      </ul>
    );
  }
}

class OtherItems extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    isLeader: PropTypes.bool.isRequired,
    startIndex: PropTypes.number,
    title: PropTypes.string
  }

  render() {
    const { props, props: { items, isLeader, startIndex, title } } = this,
    total = calculateItemTotal(items);

    return (
      <ul>
        <div className='cart__items__title'>{title}</div>
        {
          items.length 
          ? items.map((item, i) => <CartItem key={i} itemNumber={i + startIndex} isOwner={isLeader} item={item} {...props} />) 
          : <EmptyCart />
        }
        {isLeader ? <h3>Total: <span>{displayCost(total)}</span></h3> : null}
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
