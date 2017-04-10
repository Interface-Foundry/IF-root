import { connect } from 'react-redux';
import { Deals } from '../components';

const mapStateToProps = (state, ownProps) => ({
  isDropdown: ownProps.isDropdown,
  deals: state.deals.deals,
  cart_id: state.cart.cart_id
});

export default connect(mapStateToProps)(Deals);
