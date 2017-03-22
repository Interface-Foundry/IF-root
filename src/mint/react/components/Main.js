import React, { PropTypes, Component } from 'react';
import InputContainer from '../containers/InputContainer';
import CartContainer from '../containers/CartContainer';

export default class Cart extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired,
    newAccount: PropTypes.bool
  }

  render() {
    const { cart_id, accounts, newAccount } = this.props;
    const loggedIn = accounts.length > 0;
    return (
      <div>
        <h2>Cart ID #{cart_id}</h2>
        <div>Accounts: <ul>{accounts.map((account, i) => <li key={i}>{account.email_address}</li>)}</ul></div>
        <hr/>
        {loggedIn
          ? <CartContainer cart_id={cart_id}/>
          : ((newAccount || newAccount === undefined)
            ? <InputContainer cart_id={cart_id} />
            : <div>Looks like you've been here before. We just sent you an email, use that to log in! </div>)}
        <hr/>
      </div>
    );
  }
}
