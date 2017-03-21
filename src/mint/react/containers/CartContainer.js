import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Cart from '../components/Cart';
import { cart } from '../actions';
import { bindActionCreators } from 'redux'

class CartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { cart: { items: [] } };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const updateCart = dispatch(cart.update(this.props.cart_id));
    const newItems = dispatch(cart.fetchItems(this.props.cart_id));
    this.setState({ cart: newItems });
    console.log('state', this.state);
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = nextProps;
    const newCart = dispatch(cart.fetchItems(nextProps.cart_id));
    this.setState({ cart: newCart });
    console.log('state', this.state);
  }

  render() {
    const { dispatch } = this.props;
    let boundActionCreators = bindActionCreators(cart, dispatch);
    return <Cart items={this.state.cart.items} cart_id={this.props.cart_id} {...boundActionCreators} />;
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    cart_id: ownProps.cart_id
  };
};

export default connect(mapStateToProps)(CartContainer);
