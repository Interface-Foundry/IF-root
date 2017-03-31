import React, { PropTypes, Component } from 'react';
import { getAccountById } from '../../reducers';
import { getNameFromEmail } from '../../utils'

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render() {
    const { item, accounts, itemNumber } = this.props,
          linkedAccount = getAccountById({user_accounts: accounts}, {id: item.added_by}),
          leaderName = _.capitalize(getNameFromEmail(linkedAccount ? linkedAccount.email_address : null));

    return (
      <a href={item.original_link}>
        <li className='item'>
          <h4 className='item__title'>{leaderName}</h4>
          <div className='item__image image col-3 ' style={
            {
              backgroundImage: `url(//placehold.it/100x100)`,
              height: 100,
            }}/>
          <div className='item__props col-9'>
            <p>Item #{itemNumber}</p>
            <p>Price: ${item.price}</p>
            <p>Qty: {item.quantity}</p>
          </div>
        </li>
      </a>
    );
  }
}
