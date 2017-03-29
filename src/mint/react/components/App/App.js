import React, { PropTypes, Component } from 'react';
import {SignInContainer, CartContainer} from '../../containers';
import { Onboard } from '..';
import Header from './Header';

export default class App extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired,
    newAccount: PropTypes.bool,
    setCartId: PropTypes.func.isRequired,
    loggedIn: PropTypes.func.isRequired
  }

  componentWillMount() {
    const {setCartId, cart_id, loggedIn, accounts} = this.props;

    setCartId(cart_id);
  }

  componentWillReceiveProps(nextProps) {
    const {onborded, accounts, loggedIn} = this.props
    
    if (!onborded && accounts.length !== nextProps.accounts.length && nextProps.accounts.length > 0) {
      loggedIn(nextProps.accounts);
    } else if(nextProps.onborded && nextProps.accounts.length > 0) {
      loggedIn(nextProps.accounts);
    }
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
