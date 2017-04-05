import React, { PropTypes, Component } from 'react';
import CartItem from './CartItem';
import { AddAmazonItemContainer, DealsContainer } from '../../containers';

export default class Cart extends Component {
  static propTypes = {
    selectItem: PropTypes.func.isRequired,
    fetchDeals: PropTypes.func.isRequired,
    fetchCart: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    leader: PropTypes.object,
    items: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    addingItem: PropTypes.bool.isRequired
  }

  componentWillMount() {
    const { fetchCart, cart_id, fetchDeals } = this.props;
    fetchDeals();
    fetchCart(cart_id);
  }

  componentWillReceiveProps(nextProps) {
    const { history: { push, replace }, match: { url }, cart_id } = this.props;
    const { members, leader, addingItem } = nextProps;

    if (members.length === 0 &&
      !leader
    ) {
      push('m/signin');
    } else if (leader && !addingItem && this.props.addingItem !== addingItem && members.length !== 0) {
      replace(`/cart/${cart_id}/`);
    }
  }

  render() {
    const { cart_id, addItem, items, members, leader, selectItem, history: { push, replace }, match: { url } } = this.props;

    const hasItems = items.length > 0;

    return (
      <div className='cart'>
        <div className='cart__add'>
          <AddAmazonItemContainer replace={replace}/>
        </div>
        <DealsContainer isDropdown={false}/>
        <div className='cart__title'>
          <h4>{ hasItems ? `#${items.length} Items in Group Cart` : 'Group Shopping Cart' }</h4>
        </div>
        <div className='cart__items'>
          <ul>
            { 
              hasItems ? 
                items.map((item, i) => <CartItem key={i} 
                                            item={item} 
                                            itemNumber={i+1} 
                                            members={members} 
                                            leader={leader} 
                                            selectItem={selectItem}
                                            url={url}
                                            push={push}/>) 
                : <em>Please add some products to the cart.</em>
            } 
          </ul>
        </div>
    </div>
    );
  }
}
