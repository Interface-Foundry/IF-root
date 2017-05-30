// react/containers/CardsContainer.js

import { connect } from 'react-redux';
import { Cards } from '../components';
import { selectCard } from '../actions/cards';
import { search, clearItem } from '../actions/item';
import { addSearchHistory } from '../utils';
import ReactGA from 'react-ga';

const mapStateToProps = (state, ownProps) => ({
  isDropdown: ownProps.isDropdown,
  cards: state.cards.cards,
  cardType: state.cards.type,
  storeName: state.currentCart.store,
  currentCart: state.currentCart,
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
  search: (url, category) => {
    addSearchHistory(url);
    return dispatch(search(url, category));
  },
  clearItem: () => dispatch(clearItem())
});

export default connect(mapStateToProps, mapDispatchToProps)(Cards);
