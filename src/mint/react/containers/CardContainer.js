// react/containers/CardContainer.js

import { connect } from 'react-redux';
import { Cards } from '../components';
import { selectCard } from '../actions/cards';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  isDropdown: ownProps.isDropdown,
  cards: state.cards.cards,
  cardType: state.cards.type,
  cart_id: state.currentCart.cart_id,
  position: state.cards.position
});

const mapDispatchToProps = dispatch => ({
  selectCard: (cardIndex, card) => {
    ReactGA.event({
      category: 'Card',
      action: `Selected a card (number ${cardIndex}`,
    });
    return dispatch(selectCard(cardIndex, card));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Cards);
