import React, { PropTypes, Component } from 'react';
import {SignInContainer, CartContainer} from '../../containers';
import { Onboard } from '..';
import Header from './Header';

export default class App extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired,
    newAccount: PropTypes.bool,
    fetchCart: PropTypes.func.isRequired,
    loggedIn: PropTypes.func.isRequired,
    registerEmail: PropTypes.func.isRequired,
    registered: PropTypes.bool
  }

  componentWillMount() {
    const {fetchCart, cart_id, loggedIn, accounts} = this.props;

    fetchCart(cart_id);
  }

  componentWillReceiveProps(nextProps) {
    const { accounts, registerEmail, onboardNewUser } = this.props
    const { loggedIn, registered, onboarding } = nextProps

    if ( 
        onboarding &&
        !registered && 
        !loggedIn &&
        accounts.length !== nextProps.accounts.length && 
        nextProps.accounts.length > 0
    ) {
      registerEmail();
    } else if (
        onboarding &&
        registered &&
        loggedIn &&
        nextProps.accounts.length > 0
    ) {
      loggedIn(nextProps.accounts);
    } else if (
      !onboarding &&
      !registered && 
      !loggedIn &&
      accounts.length !== nextProps.accounts.length && 
      nextProps.accounts.length > 0
    ) {
      registerEmail();
      loggedIn(nextProps.accounts);
    } else if (!onboarding) {
      onboardNewUser();
    }
  }

  render() {
    const { cart_id, accounts, newAccount, loggedIn } = this.props;

    return (
      <section>
        <Header cart_id={cart_id}/>
        <div>
          {loggedIn ? 
            <p>
              <strong>Accounts:</strong>
              {accounts.map((account, i) => <span key={i}>{account.email_address}</span>)}
            </p>
            : null}
        </div>
        <div>
          {/* This should be an overlay on top of the CartContainer at some point */}
          {loggedIn ? 
            null
            : <SignInContainer/>}
          <CartContainer/>
        </div>
      </section>
    );
  }
}
