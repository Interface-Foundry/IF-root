import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Cart } from '../components';
import { cart } from '../actions';
import { bindActionCreators } from 'redux';

class CartContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired
  }

  componentDidMount() {
    const { dispatch, cart_id } = this.props;
    dispatch(cart.fetchItems(cart_id));
  }

  render() {
    const { dispatch, items, cart_id } = this.props;
    let boundActionCreators = bindActionCreators(cart, dispatch);
    return <Cart items={items} cart_id={cart_id} {...boundActionCreators} />;
  }
}

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.cart_id,
  items: state.cart.items
});

export default connect(mapStateToProps)(CartContainer);
