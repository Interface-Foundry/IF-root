import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Cart from '../components/Cart';
import { cart } from '../actions';
import { bindActionCreators } from 'redux'

class CartContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { cart: { items: {} } };
  }
  
  componentDidMount() {
    const { dispatch } = this.props;
    this.state.cart = dispatch(cart.fetchItems(this.props.cart_id));
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = nextProps;
    this.state.cart = dispatch(cart.fetchItems(nextProps.cart_id));
  }

  render() {
    console.log('items', this.state.cart.items);
    const {dispatch} = this.props;
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
