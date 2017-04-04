import React, { PropTypes, Component } from 'react';
import { getMemberById } from '../../reducers';
import { getNameFromEmail } from '../../utils'

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render() {
    const { item, members, itemNumber, leader, selectItem, push, url } = this.props,
          linkedMember = getMemberById({members: members, leader: leader}, {id: item.added_by}),
          memberName = _.capitalize(getNameFromEmail(linkedMember ? linkedMember.email_address : null));

    return (
      <li className='cartItem' onClick={e => {
        selectItem(item)
        push(`${url}/m/item/${item.id}`)
      }}>
        <h4 className='cartItem__title'>{memberName}</h4>
        <div className='cartItem__image image col-3 ' style={
          {
            backgroundImage: `url(//placehold.it/100x100)`,
            height: 100,
          }}/>
        <div className='cartItem__props col-9'>
          <p>Item #{itemNumber}</p>
          <p>Price: ${item.price}</p>
          <p>Qty: {item.quantity}</p>
        </div>
      </li>
    );
  }
}
