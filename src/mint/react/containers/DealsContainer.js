// react/containers/DealsContainer.js

import { connect } from 'react-redux';
import { Deals } from '../components';
import { selectDeal } from '../actions/deals';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  isDropdown: ownProps.isDropdown,
  deals: state.deals.deals,
  cart_id: state.currentCart.cart_id,
  position: state.deals.position
});

const mapDispatchToProps = dispatch => ({
  selectDeal: (dealIndex, deal) => {
    ReactGA.event({
      category: 'Deal',
      action: `Selected a deal (number ${dealIndex}`,
    });
    dispatch(selectDeal(dealIndex, deal));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Deals);
