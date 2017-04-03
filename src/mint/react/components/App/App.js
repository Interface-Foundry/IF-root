import React, { PropTypes, Component } from 'react';
import { CartContainer } from '../../containers';
import { Overlay, Modal } from '..';
import Header from './Header';

export default class App extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired,
    fetchCart: PropTypes.func.isRequired,
    changeModalComponent: PropTypes.func.isRequired,
    members: PropTypes.array.isRequired,
    leader: PropTypes.object,
    modal: PropTypes.string,
    addingItem: PropTypes.bool.isRequired,
    newAccount: PropTypes.bool
  }

  componentWillMount() {
    const { fetchCart, cart_id } = this.props;

    fetchCart(cart_id);
  }

  componentWillReceiveProps(nextProps) {
    const { changeModalComponent } = this.props;
    const { members, leader, modal, addingItem } = nextProps;

    if (!modal &&
      members.length === 0 &&
      !leader
    ) {
      changeModalComponent('EmailFormContainer');
    } else if (leader && this.props.modal === modal && !addingItem) {
      changeModalComponent(null);
    }
  }

  render() {
    const { cart_id, newAccount, leader, modal, changeModalComponent } = this.props;

    if (newAccount === false) {
      return <Overlay/>;
    }

    return (
      <section className='app'>
        <Header cart_id={cart_id} leader={leader}/>
        {modal
          ? <Modal component={modal} changeModalComponent={changeModalComponent}/>
          : null}
        <CartContainer/>
      </section>
    );
  }
}
