// mint/react/components/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CartItem from './CartItem';
import { AddAmazonItemContainer, CardsContainer, AddressFormContainer } from '../../containers';
import { Icon } from '../../../react-common/components';
import { calculateItemTotal, displayCost } from '../../utils';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import moment from 'moment';
import { Route } from 'react-router';

export default class Cart extends Component {
  static propTypes = {
    fetchCards: PropTypes.func.isRequired,
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
    cards: PropTypes.array,
    cancelRemoveItem: PropTypes.func.isRequired,
    cancelClearCart: PropTypes.func
  }

  state = {
    animation: false
  }

  addressFormData = [{
    head: 'Your YPO Account',
    fields: [{
      name: 'ypo_account_name',
      placeholder: 'YPO Account Name',
      label: 'YPO Account Name',
      type: 'text',
      required: true,
      autofocus: true, //there can only be one autofocus
      value: 'Chris' //should come from saved data
    }, {
      name: 'ypo_account_number',
      placeholder: 'YPO Account Number',
      label: 'YPO Account Number',
      type: 'number',
      required: true,
      value: '1234'
    }, {
      name: 'ypo_voucher_code',
      placeholder: 'YPO Voucher Code',
      label: 'YPO Voucher Code',
      type: 'text',
      required: true,
      value: 'ChrisVoucher'
    }]
  }, {
    head: 'Your Address',
    fields: [{
      name: 'full_name',
      placeholder: 'Full Name',
      label: 'Full Name',
      type: 'text',
      required: true,
      value: 'Chris Barry'
    }, {
      name: 'line_1',
      placeholder: 'Address Line 1',
      label: 'Street Address, P.O. Box, Company Name, C/O',
      type: 'text',
      required: true,
      value: '180 Prospect'
    }, {
      name: 'line_2',
      placeholder: 'Address Line 2',
      label: 'Apartment, Suite, Unit, Building, Floor, etc.',
      type: 'text',
      value: 'Apt 4 D'
    }, {
      name: 'city',
      placeholder: 'City',
      label: 'City',
      type: 'text',
      required: true,
      value: 'Brooklyn'
    }, {
      name: 'region',
      placeholder: 'State/Province/Region',
      label: 'State/Province/Region',
      type: 'text',
      required: true,
      value: 'NY'
    }, {
      name: 'code',
      placeholder: 'Zip/Postal Code',
      label: 'Zip/Postal Code',
      type: 'text',
      required: true,
      value: '18014'
    }, {
      name: 'country',
      placeholder: 'Country',
      label: 'Country',
      type: 'text',
      required: true,
      value: 'USA'
    }, {
      name: 'delivery_message',
      placeholder: 'Delivery Message',
      label: 'Delivery Message',
      type: 'text'
    }]
  }]

  componentWillMount() {
    const { fetchCards, cards = [], currentCart = { store: '' } } = this.props;

    if (cards.length === 0 && currentCart.store === 'ypo') {
      fetchCards();
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
    const { history: { replace }, fetchCards, cart_id, items, cards } = this.props, { leader, addingItem, user_account } = nextProps,
      cartId = nextProps.cart_id || cart_id;

    if (cartId) {
      if (cards.length === 0 && nextProps.currentCart.store === 'ypo') fetchCards(cartId);
      if (!!leader && !addingItem && this.props.addingItem !== addingItem && !!user_account.id) replace(`/cart/${cartId}/`);
    }

    if (items.quantity < nextProps.items.quantity && items.quantity !== 0 && cart_id === nextProps.cart_id) {
      this._runAnimation('✓ Item Added to Kip Cart');
    } else if (items.quantity > nextProps.items.quantity && items.quantity !== 0 && cart_id === nextProps.cart_id) {
      setTimeout(() => this._runAnimation('× Item Removed from Kip Cart'), 10050); // don't show until after animation
    }
  }

  render() {
    const {
      props: {
        items,
        leader,
        members,
        user_account,
        cart_id,
        cards,
        locked,
        updateCart,
        currentCart,
        cancelRemoveItem,
        cancelClearCart,
        history: { push }
      },
      state: { animation },
      addressFormData
    } = this,
    hasItems = items.quantity > 0,
      isLeader = !!user_account.id && !!leader && (leader.id === user_account.id),
      total = calculateItemTotal([
        ...items.my,
        ...items.others.reduce((acc, member) => [...acc, ...member.items], [])
      ]);
    let cartItemIndex = items.my.length;

    const locale = currentCart.store ? currentCart.store.includes('amazon') ? (currentCart.store_locale === 'UK' ? 'GBP' : 'USD') : 'GBP' : null;

    return (
      <div className='cart'>
        <Route path={'/cart/:cart_id/address'} exact component={(props) => <AddressFormContainer {...props} formData={addressFormData}/>}/>
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
              {cards.length > 0 ? <CardsContainer isDropdown={false}/> : null}
            </div>
        }
        <div className={`cart__title ${animation || currentCart.itemDeleted || currentCart.oldItems.length  ? 'action' : ''}`}>
          { animation
            ? <h4>{animation}</h4>
            : currentCart.itemDeleted ? <h4 className='undo__button' onClick={cancelRemoveItem}>Item Removed. <a href='#'>Undo</a></h4>
            : currentCart.oldItems.length ? <h4 className='undo__button' onClick={cancelClearCart}>Cart cleared. <a href='#'>Undo</a></h4>
            : <h4>
              { hasItems ? `${items.quantity} items in Kip Cart`  : 'Kip Cart' }
              {
                !!leader && leader.id === user_account.id
                ?  <span> – <span className='price'>{displayCost(total, locale)} Total</span></span>
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
    currentCart: PropTypes.object,
    user_account: PropTypes.object
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
    const { props: { items, user_account, currentCart: { locked }, currentCart } } = this,
    total = calculateItemTotal(items),
      locale = currentCart.store ? currentCart.store.includes('amazon') ? currentCart.store_locale === 'UK' ? 'GBP' : 'USD' : 'GBP' : null;

    return (
      <ul>
        {items.length ? <div className='cart__items__title'>{user_account.name} <span> - {items.length} Items</span></div> :null}
        <div className='cart__items__container'>
          {
            items.length 
            ? this.renderList() 
            : user_account.id ? <EmptyCart key="empty"/> : null
          }
        </div>
        {items.length ? <h3>Total: <span className={locked ? 'locked' : ''}>{displayCost(total, locale)}</span></h3>:null}
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
    const { props, props: { isLeader, startIndex, member: { items, name, email, id }, currentCart: { locked, name: cartName }, currentCart } } = this,
    total = calculateItemTotal(items);
    const locale = currentCart.store ? currentCart.store.includes('amazon') ? (currentCart.store_locale === 'UK' ? 'GBP' : 'USD') : 'GBP' : null;

    return (
      <ul>
       {
        email
        ? <a href={`mailto:${email}?subject=From ${cartName}`}>
            <div key={id} className='cart__items__title'>{name}
              <br/><span className='email'>{email} <span>- {items.length} Items</span></span>
            </div>
          </a>
        : <div key={id} className='cart__items__title'>{name} <span>- {items.length} Items</span></div>
        }
        {
          items.length
          ? items.map((item, i) => <CartItem key={i} itemNumber={i + startIndex} isOwner={isLeader} item={item} {...props} />)
          : <EmptyCart />
        }
        {isLeader ? <h3>Total: <span className={locked ? 'locked' : ''}>{displayCost(total, locale)}</span></h3> : null}
      </ul>
    );
  }
}

class EmptyCart extends Component {
  render() {
    return (
      <li className='cart__items-empty'>
        <h4><span>Hello!</span><br></br>Looks like you haven't added any items yet. Search above to get started, or invite others to add to the cart by tapping the Share button below 😊</h4>
        <div className='image' style={{backgroundImage:'url(//storage.googleapis.com/kip-random/head_smaller.png)'}}/>
      </li>
    );
  }
}