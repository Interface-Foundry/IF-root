import React, { PropTypes, Component } from 'react';
import {SignInContainer, CartContainer} from '../../containers';
import { Onboard } from '..';
import Header from './Header';

export default class Cart extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired,
    newAccount: PropTypes.bool,
    setCartId: PropTypes.func.isRequired,
  }

  componentWillMount() {
    const {setCartId, cart_id} = this.props;
    setCartId(cart_id);
  }

  render() {
    const { cart_id, accounts, newAccount, onborded } = this.props;

    return (
      <section>
        <Header cart_id={cart_id}/>
        <div>
          {onborded ? 
            <p>
              <strong>Accounts:</strong>
              {accounts.map((account, i) => <span key={i}>{account.email_address}</span>)}
            </p>
            : null}
        </div>
        <div>
          {/* This should be an overlay on top of the CartContainer at some point */}
          {onborded ? 
            null
            : <SignInContainer/>}
          <CartContainer/>
        </div>
      </section>
    );
  }
}