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
    items: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
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
      hasItems = items.length > 0,
      isLeader = user_accounts[0] && leader && (leader.id === user_accounts[0].id),
      myItems = _.reduce(items, (acc, item) => {
        user_accounts[0] ? ( item.added_by === user_accounts[0].id ? acc.push(item) : null ) : null;
        return acc;
      }, []),
      othersItems = _.reduce(items, (acc, item) => {
        user_accounts[0] ? ( item.added_by !== user_accounts[0].id ? acc.push(item) : null ) : null;
        return acc;
      }, []);

    return (
      <div className='cart'>
        <div className='cart__add'>
          <AddAmazonItemContainer replace={replace} members={members}/>
        </div>
        <DealsContainer isDropdown={false}/>
        <div className='cart__title'>
          <h4>{ hasItems ? `${items.length} items in Group Cart` : 'Group Shopping Cart' }</h4>
        </div>
        <div className='cart__items'>
          <ul>
            { 
              myItems.length ? 
                myItems.map((item, i) => <CartItem key={i} isOwner={true} itemNumber={i} {...item} {...this.props} url={url} push={push}/>) 
                : <li><em>Please add some products to the cart.</em></li>
            } 
          </ul>
          <hr/>
            <div> Other's items </div>
          <hr/>
          <ul>
            {
              othersItems.length ? 
                othersItems.map((item, i) => <CartItem key={i} isOwner={isLeader} itemNumber={i} {...item} {...this.props} url={url} push={push}/>) 
                : <li><em>Nobody else has added anything yet!</em></li>
            }
          </ul>
        </div>
    </div>
    );
  }
}
