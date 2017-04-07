import React, { PropTypes, Component } from 'react';
import { getMemberById } from '../../reducers';
import { getNameFromEmail } from '../../utils';

export default class Item extends Component {
  static propTypes = {
    added_by: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    locked: PropTypes.bool.isRequired,
    main_image_url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    store: PropTypes.string.isRequired,
    thumbnail_url: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    leader: PropTypes.object.isRequired,
    members: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    push: PropTypes.func.isRequired,
    itemNumber: PropTypes.number.isRequired
  }

  render() {
    const { added_by, description, itemNumber, main_image_url, name, price, quantity, leader, members, } = this.props,
      linkedMember = getMemberById({ members: members, leader: leader }, { id: added_by }),
      memberName = _.capitalize(getNameFromEmail(linkedMember ? linkedMember.email_address : null));

    return (
      <li className='cartItem'>
        <h4 className='cartItem__title'>{memberName}</h4>

        <div className='cartItem__image image col-2 ' style={
          {
            backgroundImage: `url(${main_image_url})`,
            height: 100,
          }}/>
        <div className='cartItem__props col-2'>
          <p>Item #{itemNumber}</p>
          <p>{name}</p>
          <p>Price: ${price}</p>
          <p>Qty: {quantity}</p>
        </div>
        <div className='cartItem__props col-8'>
          <p>{description}</p>
        </div>
      </li>
    );
  }
}
