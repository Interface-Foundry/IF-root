import React, { PropTypes, Component } from 'react';
import { Route } from 'react-router';

import { CartContainer } from '../../containers';
import { Overlay, Modal } from '..';
import Header from './Header';
import Sidenav from './Sidenav';

export default class App extends Component {
  state = {
    sidenav: false
  }

  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    leader: PropTypes.object,
    carts: PropTypes.arrayOf(PropTypes.object),
    modal: PropTypes.string,
    newAccount: PropTypes.bool,
    currentUser: PropTypes.object,
    match: PropTypes.object.isRequired,
    fetchCart: PropTypes.func.isRequired,
    fetchAllCarts: PropTypes.func.isRequired
  }

  componentWillMount() {
    const { fetchCart, fetchAllCarts, cart_id } = this.props;
    if (cart_id) fetchCart(cart_id);
    fetchAllCarts();
  }

  componentWillReceiveProps(nextProps) {
    const { fetchCart, fetchAllCarts, cart_id } = this.props;
    
    if (cart_id !== nextProps.cart_id) {
      fetchCart(nextProps.cart_id);
      fetchAllCarts();
    }
  }

  _toggleSidenav = () => {
    const { sidenav } = this.state;
    this.setState({ sidenav: !sidenav });
  }

  render() {
    const { props, state, _toggleSidenav } = this;
    const { cart_id, newAccount, leader, carts, match, currentUser } = props;
    const { sidenav } = state;

    if (newAccount === false) {
      return <Overlay/>;
    }

    return (
      <section className='app'>

        <Header {...props}  _toggleSidenav={ _toggleSidenav} />
        { sidenav ? <Sidenav cart_id={cart_id} leader={leader} carts={carts} _toggleSidenav={_toggleSidenav} currentUser={currentUser}/> : null }

        { /* Renders modal when route permits */ }
        <Route path={`${match.url}/m/`} component={Modal} />

        { /* Renders cart when route permits */ }
        <Route path={`${match.url}`} exact component={CartContainer} />
      </section>
    );
  }
}
