import React, { PropTypes, Component } from 'react';
import { SignInContainer, CartContainer } from '../../containers';
import { Onboard, Overlay, Modal } from '..';
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
    const { changeModalComponent } = this.props
    const { members, leader, modal, addingItem } = nextProps

    if (
      !modal &&
      members.length === 0 &&
      !leader
    ) {
      changeModalComponent('EmailFormContainer')
    } else if (leader && this.props.modal === modal) {
      changeModalComponent(null)
    }
  }

  render() {
    const { cart_id, newAccount, accounts, leader, currentView, modal, changeModalComponent } = this.props

    if (newAccount === false)
      return <Overlay/>

    return (
      <section className='app'>
        <Header cart_id={cart_id} leader={leader}/>
        {/* This should be an overlay on top of the CartContainer at some point */}
        {modal ? 
          <Modal component={modal} changeModalComponent={changeModalComponent}/>
          : null}
        <CartContainer/>
      </section>
    );
  }
}

