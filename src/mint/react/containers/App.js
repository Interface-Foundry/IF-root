import React, { PropTypes } from 'react'
import InputContainer from './InputContainer';
import CartContainer from './CartContainer';
import { connect } from 'react-redux'

const App = ({ cart_id }) => (
  <div>
    <h2>Cart ID #{cart_id}</h2>
    <hr/>
    <InputContainer cart_id={cart_id} />
    <hr/>
  </div>
);

App.propTypes = {
  cart_id: PropTypes.string
};

const mapStateToProps = (state, ownProps) => ({
  cart_id: ownProps.match.params.cart_id
});

export default connect(mapStateToProps)(App);
