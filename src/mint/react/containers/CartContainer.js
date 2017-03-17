import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Cart from '../components/Cart';
import { cart } from '../actions';

class CartContainer extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const { dispatch } = this.props;
    console.log('context', this.context);
    // this.props.cart = dispatch(cart.fetchItems(this.props.cart_id));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cart !== this.props.cart) {
      const { dispatch } = nextProps;
      this.state.cart = dispatch(cart.fetchItems(nextProps.cart_id));
    }
  }

  render() {
    return <Cart items={this.props.cart.items} cart_id={this.props.cart_id} />;
  }
}

const mapStateToProps = (state, ownProps) => {
  console.log('state', state)
  return {
    cart_id: ownProps.cart_id
  };
};

export default connect(mapStateToProps)(CartContainer);
