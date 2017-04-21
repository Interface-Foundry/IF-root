import { connect } from 'react-redux';
import { Deals } from '../components';
import { selectDeal } from '../actions/deals';

const mapStateToProps = (state, ownProps) => ({
  isDropdown: ownProps.isDropdown,
  deals: state.deals.deals,
  cart_id: state.currentCart.cart_id,
  position: state.deals.position
});

const mapDispatchToProps = dispatch => ({
  selectDeal: (dealIndex) => dispatch(selectDeal(dealIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Deals);
