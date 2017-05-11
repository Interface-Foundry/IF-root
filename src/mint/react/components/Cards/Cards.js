// react/components/Cards/Cards.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CategoryCard from './CategoryCard';
import SearchCard from './SearchCard';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import { Link } from 'react-router-dom';
import { getLastSearch } from '../../utils';

export default class Cards extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
    this.delayDropDown = ::this.delayDropDown;
    this.state = {
      isDropdown: false
    };
  }

  static propTypes = {
    isDropdown: PropTypes.bool,
    cards: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    cart_id: PropTypes.string,
    selectDeal: PropTypes.func
  }

  componentWillUnmount() {
    const { delayDropDown } = this;
    delayDropDown(true);
  }

  componentDidMount() {
    const { delayDropDown } = this;
    delayDropDown();
  }

  delayDropDown(stop) {
    const { props: { isDropdown } } = this;

    if (stop) {
      if (self) clearTimeout(self.timeout);
      clearTimeout(this.timeout);
    } else if (this.refs.cards) {
      let self = this;
      self.timeout = setTimeout(() => {
        self.setState({
          isDropdown: isDropdown
        });
        self.delayDropDown();
      }, 100);
    } else {
      if (self) clearTimeout(self.timeout);
      clearTimeout(this.timeout);
    }
  }

  renderCards() {
    const { isDropdown } = this.state;
    let { cards, cart_id, selectCard, cardType } = this.props;
    if (isDropdown) cards = cards.slice(0, 5);

    const activeCards = cards.map((card, i) => (
      <li key={card.id} onClick={(e) => selectCard(i, card)}>
        {cardType === 'search' ? <Link to={`/cart/${cart_id}/m/search/${i}/${encodeURIComponent(getLastSearch())}`}>
          <SearchCard {...card} cart_id={cart_id} index={i}/>
        </Link> : <CategoryCard {...card} cart_id={cart_id} index={i}/>}
      </li>
    ));

    return (
      <CSSTransitionGroup
        transitionName="cardsItem"
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}>
        {activeCards}
      </CSSTransitionGroup>
    );
  }

  render() {
    const { renderCards, state: { isDropdown } } = this;
    return (
      <div>
        <ul ref='cards' className={'cards__section' + (isDropdown ? '-small' : '')}>
          { renderCards() }
        </ul>
      </div>
    );
  }
}
