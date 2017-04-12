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
    const { items, members, history: { push, replace }, match: { url } } = this.props;
    const hasItems = items.length > 0;

    return (
      <div className='cart'>
        <div className='cart__add'>
          <AddAmazonItemContainer replace={replace} members={members}/>
        </div>
        <DealsContainer isDropdown={false}/>
        <div className='cart__title'>
          <h4>{ hasItems ? `#${items.length} Items in Group Cart` : 'Group Shopping Cart' }</h4>
        </div>
        <div className='cart__items'>
          <ul>
            { 
              hasItems ? 
                items.map((item, i) => <CartItem key={i} itemNumber={i} {...item} {...this.props} url={url} push={push}/>) 
                : <em>Please add some products to the cart.</em>
            } 
          </ul>
        </div>
    </div>
    );
  }
}
