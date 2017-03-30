import React, { PropTypes, Component } from 'react';
import {SignInContainer, CartContainer} from '../../containers';
import { Onboard } from '..';
import Header from './Header';

export default class App extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired
  }

  componentWillMount() {
    const { fetchCart, cart_id } = this.props;

    fetchCart(cart_id);
  }

  componentWillReceiveProps(nextProps) {
    const {changeKipFormView} = this.props
    const {memebers, leader, currentView} = nextProps

    if(
      currentView === 0 &&
      memebers.length === 0 && 
      !leader
    ) {
      changeKipFormView(1)
    } else if (leader) {
      changeKipFormView(0)
    }
  }

  render() {
    const { cart_id, memebers, leader, newAccount, accounts, currentView } = this.props,
          showForm = currentView !== 0,
          accountPresent = accounts.length > 0;

    return (
      <section>
        <Header cart_id={cart_id}/>
        <div>
          {accountPresent ? 
            <p>
              <strong>Accounts:</strong>
              {accounts.map((account, i) => <span key={i}>{account.email_address}</span>)}
            </p>
            : null}
        </div>
        <div>
          {/* This should be an overlay on top of the CartContainer at some point */}
          {showForm ? 
            <SignInContainer/>
            : null}
          <CartContainer/>
        </div>
      </section>
    );
  }
}
