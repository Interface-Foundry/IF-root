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
    loggedIn: PropTypes.func.isRequired,
    registerEmail: PropTypes.func.isRequired,
    registered: PropTypes.bool
  }

  componentWillMount() {
    const {setCartId, cart_id, loggedIn, accounts} = this.props;

    setCartId(cart_id);
  }

  componentWillReceiveProps(nextProps) {
    const { accounts, loggedIn, registerEmail, onboardNewUser } = this.props
    const { loggedin, registered, onboarding } = nextProps

    if ( 
        onboarding &&
        !registered && 
        !loggedin &&
        accounts.length !== nextProps.accounts.length && 
        nextProps.accounts.length > 0
    ) {
      registerEmail();
    } else if (
        onboarding &&
        registered &&
        loggedin &&
        nextProps.accounts.length > 0
    ) {
      loggedIn(nextProps.accounts);
    } else if (
      !onboarding &&
      !registered && 
      !loggedin &&
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
    const { cart_id, accounts, newAccount, loggedin } = this.props;

    return (
      <section>
        <Header cart_id={cart_id}/>
        <div>
          {loggedin ? 
            <p>
              <strong>Accounts:</strong>
              {accounts.map((account, i) => <span key={i}>{account.email_address}</span>)}
            </p>
            : null}
        </div>
        <div>
          {/* This should be an overlay on top of the CartContainer at some point */}
          {loggedin ? 
            null
            : <SignInContainer/>}
          <CartContainer/>
        </div>
      </section>
    );
  }
}
