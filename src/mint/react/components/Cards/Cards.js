// react/components/Cards/Cards.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CategoryCard from './CategoryCard';
import SearchCard from './SearchCard';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

export default class Cards extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
  }

  static propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    cart_id: PropTypes.string,
    selectDeal: PropTypes.func
  }

  shouldComponentUpdate (nextProps, nextState){
    console.log(nextProps.cards.length !== this.props.cards.length)
    if(nextProps.cards.length !== this.props.cards.length) return true;

    return false;
  }

  renderCards() {
    let { cards, cart_id, selectCard, cardType, previewAmazonItem } = this.props;

    const activeCards = cards.map((card, i) => {
      return <li key={card.id || card.machineName} onClick={(e) => selectCard(i + 1, card)}>
        {
          cardType === 'search' ? <SearchCard {...card} cart_id={cart_id} index={i}/> : <CategoryCard {...card} cart_id={cart_id} index={i} previewAmazonItem={previewAmazonItem}/>
        }
      </li>
    });

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
    const { renderCards} = this;
    return (
      <div>
        <ul ref='cards' className={'cards__section'}>
          { renderCards() }
        </ul>
      </div>
    );
  }
}
