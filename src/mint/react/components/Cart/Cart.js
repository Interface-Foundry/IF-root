// mint/react/components/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CartItem from './CartItem';
import { AddAmazonItemContainer, DealsContainer } from '../../containers';
import { Icon } from '..';
import { calculateItemTotal, displayCost } from '../../utils';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import moment from 'moment';

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
    currentCart: PropTypes.object,
    deals: PropTypes.array,
    cancelRemoveItem: PropTypes.func.isRequired
  }

  state = {
    animation: false
  }

  componentWillMount() {
    const { fetchDeals, deals } = this.props;

    if (deals.length === 0) {
      fetchDeals();
    }
  }

  _runAnimation(text) {
    this.setState({ animation: text });

    this.timeout = setTimeout(() => {
      this.setState({
        animation: false
      });
    }, 3000);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  componentWillReceiveProps(nextProps) {
    const { history: { replace }, cart_id, items } = this.props, { leader, addingItem, user_account } = nextProps,
      cartId = nextProps.cart_id || cart_id;

    if (cartId) {
      if (!user_account.id && !leader) {
        replace(`/cart/${cartId}/m/signin`);
      } else if (!!leader && !addingItem && this.props.addingItem !== addingItem && !!user_account.id) {
        replace(`/cart/${cartId}/`);
      }
    }

    if (items.quantity < nextProps.items.quantity && items.quantity !== 0 && cart_id === nextProps.cart_id) {
      this._runAnimation('✓ Item Added to Kip Cart');
    } else if (items.quantity > nextProps.items.quantity && items.quantity !== 0 && cart_id === nextProps.cart_id) {
      setTimeout(() => this._runAnimation('× Item Removed from Kip Cart'), 10050); // don't show until after animation
    }
  }

  render() {
    const { items, leader, members, user_account, cart_id, deals, history: { push }, locked, updateCart, currentCart, cancelRemoveItem } = this.props, { animation } = this.state,
      hasItems = items.quantity > 0,
      isLeader = !!user_account.id && !!leader && (leader.id === user_account.id),
      total = calculateItemTotal([
        ...items.my,
        ...items.others.reduce((acc, member) => [...acc, ...member.items], [])
      ]);
    let cartItemIndex = items.my.length;
    return (
      <div className='cart'>
        {
          locked 
          ? <div className='cart__locked'>
              <div className='cart__locked__actions'>
                {/*<button className='primary'><Icon icon='Refresh'/><h1>RE-ORDER CART</h1></button>*/}
                { !!leader && leader.id === user_account.id ? <button className='secondary' onClick={(e)=>{e.preventDefault(); window.open(`/api/cart/${cart_id}/checkout`);}}><Icon icon='Cart'/><h1>CHECKOUT<br/>{displayCost(total)}</h1></button> : null }
              </div>
              <div className='cart__locked-container'>
                <div className='cart__locked__text'>
                  <p>{currentCart.name ? currentCart.name : `${user_account.name ? user_account.name.capitalize() + '\'s ' : ''}Kip Cart`}</p>
                  <p>{moment(currentCart.updatedAt).format('L')}&nbsp;{moment(currentCart.updatedAt).format('LT')}</p>
                </div>
                {
                  !!leader && leader.id === user_account.id ? <button onClick={() => updateCart({...currentCart, locked: !currentCart.locked})}>
                    <Icon icon='Locked'/>
                    Unlock
                  </button> : null
                }
              </div>
            </div> 
          : <div className='add__item'>
              <div className='cart__add'>
                <AddAmazonItemContainer push={push} members={members}/>
              </div>
              {
                !!user_account.id && deals.length
                  ? <DealsContainer isDropdown={false}/> 
                  : null
              }
            </div>
        }
        <div className={`cart__title ${animation || currentCart.itemDeleted  ? 'action' : ''}`}>
          { animation 
            ? <h4>{animation}</h4>
            : currentCart.itemDeleted ? <h4 className='undo__button' onClick={cancelRemoveItem}>Item Removed. <a href='#'>Undo</a></h4>
            : <h4>
              { hasItems ? `${items.quantity} items in Kip Cart`  : 'Kip Cart' } 
              {
                !!leader && leader.id === user_account.id 
                ?  <span> – <span className='price'>{displayCost(total)} Total</span></span> 
                : null
              }
            </h4>
          }
        </div>
        
        <div className='cart__items'>
          <MyItems {...this.props} items={items.my} />
          {
            items.others.map(
              member => {
                let tempIndex = cartItemIndex;
                cartItemIndex += member.items.length;
                return <OtherItems {...this.props} key={member.id} member={member} startIndex={tempIndex} isLeader={isLeader} />;
              }
            )
          }
        </div>
      </div>
    );
  }
}

class MyItems extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    currentCart: PropTypes.object
  }

  renderList() {
    const { props, props: { items } } = this,
    cartItems = items.map((item, i) => <CartItem key={item.id} itemNumber={i} isOwner={true} item={item} {...props} />);

    return (
      <CSSTransitionGroup
        transitionName="cartItem"
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}>
        {cartItems}
      </CSSTransitionGroup>
    );
  }

  render() {
    const { props: { items, user_account, currentCart: { locked } } } = this,
    total = calculateItemTotal(items);

    return (
      <ul>
        <div className='cart__items__title'>{user_account.name}</div>
        <div className='cart__items__container'>
          {
            items.length 
            ? this.renderList() 
            : <EmptyCart key="empty"/>
          }
        </div>
        <h3>Total: <span className={locked ? 'locked' : ''}>{displayCost(total)}</span></h3>
      </ul>
    );
  }
}

class OtherItems extends Component {
  static propTypes = {
    member: PropTypes.object.isRequired,
    isLeader: PropTypes.bool.isRequired,
    startIndex: PropTypes.number,
    currentCart: PropTypes.object
  }

  render() {
    const { props, props: { isLeader, startIndex, member: { items, name, email, id }, currentCart: { locked }, } } = this,
    total = calculateItemTotal(items);

    return (
      <ul>
        <div key={id} className='cart__items__title'>{name}<a href={`mailto:${email}`} className='email'>{email}</a></div>
        {
          items.length 
          ? items.map((item, i) => <CartItem key={i} itemNumber={i + startIndex} isOwner={isLeader} item={item} {...props} />) 
          : <EmptyCart />
        }
        {isLeader ? <h3>Total: <span className={locked ? 'locked' : ''}>{displayCost(total)}</span></h3> : null}
      </ul>
    );
  }
}

class EmptyCart extends Component {
  render() {
    return (
      <li className='cart__items-empty'>
        <div className='image' style={{backgroundImage:'url(//storage.googleapis.com/kip-random/head_smaller.png)'}}/>
      </li>
    );
  }
}
