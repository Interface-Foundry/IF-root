import React, { PropTypes, Component } from 'react';
import CartItem from './CartItem';
import { AddAmazonItemContainer, DealsContainer } from '../../containers';

export default class Cart extends Component {
  static propTypes = {
    selectItem: PropTypes.func.isRequired,
    fetchDeals: PropTypes.func.isRequired,
    cart_id: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    leader: PropTypes.object,
    items: PropTypes.object.isRequired,
    addingItem: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    carts: PropTypes.array.isRequired,
    removeItem: PropTypes.func.isRequired,
    user_accounts: PropTypes.array
  }

  componentWillMount() {
    const { fetchDeals } = this.props;
    fetchDeals();
  }

  componentWillReceiveProps(nextProps) {
    const { history: { replace }, cart_id } = this.props;
    const { leader, addingItem, user_accounts } = nextProps;
    const cartId = cart_id || nextProps.cart_id;

    if (cartId) {
      if (user_accounts.length === 0 && !leader) {
        replace(`/cart/${cartId}/m/signin`);
      } else if (leader && !addingItem && this.props.addingItem !== addingItem && user_accounts.length !== 0) {
        replace(`/cart/${cartId}/`);
      }
    }
  }

  render() {
    const { items, leader, members, user_accounts, history: { push, replace }, match: { url } } = this.props,
      hasItems = items.quantity > 0,
      isLeader = user_accounts[0] && leader && (leader.id === user_accounts[0].id);

    return (
      <div className='cart'>
        <div className='cart__add'>
          <AddAmazonItemContainer replace={replace} members={members}/>
        </div>
        <DealsContainer isDropdown={false}/>
        <div className='cart__title'>
          <h4>{ hasItems ? `${items.quantity} items in Group Cart` : 'Group Shopping Cart' }</h4>
        </div>
        <div className='cart__items'>
          {
            _.map(items, (ownerArray, ownerKey) => {
              if(ownerKey === 'quantity') return null

              return <ul key={ownerKey}>
                <div className='cart__items__title'>{ `${_.capitalize(ownerKey)} items`}</div>
                { 
                  ownerArray.length ? 
                    ownerArray.map((item, i) => <CartItem key={i} isOwner={true} itemNumber={i} {...item} {...this.props} url={url} push={push}/>) 
                    : <li><em>Please add some products to the cart.</em></li>
                } 
              </ul>
            })
          }
        </div>
    </div>
    );
  }
}
