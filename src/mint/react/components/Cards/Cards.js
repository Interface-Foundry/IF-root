// react/components/Cards/Cards.js

import PropTypes from 'prop-types';
import _ from 'lodash';
import React, { Component } from 'react';
import CategoryCard from './CategoryCard';
import SearchCard from './SearchCard';
import { getLastSearch } from '../../utils';
import { Icon } from '..';
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
    if(nextProps.cards.length !== this.props.cards.length || nextProps.cardType !== this.props.cardType) return true;

    return false;
  }


  renderCards() {
    let { cards, cart_id, selectCard, cardType, previewAmazonItem } = this.props;


    const activeCards = cards.map((card, i) => {
      return <li key={i} onClick={(e) => selectCard(i + 1, card)}>
        {
          cardType.includes('search')  ? <SearchCard {...card} cart_id={cart_id} index={i}/> : <CategoryCard {...card} cart_id={cart_id} index={i} previewAmazonItem={previewAmazonItem}/>
        }
      </li>
    });

    console.log(activeCards)

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
    const { renderCards, props: { cardType, position, cards, clearItem }} = this,
      type = cardType || 'categories';

    console.log(cardType)

    return (
      <div>
        <ul ref='cards' className={'cards__section'}>
          <p className='cards__section__breadcrumb'>
            <span className='cards__section__breadcrumb-type' onClick={() => clearItem()}>
              {_.capitalize(type.split('-search')[0])}
            </span> 
            { 
              type.includes('search') ? <em>
              <Icon icon='RightChevron'/>
              <span>
                {`${getLastSearch()}`}
              </span> </em> : null
            }
          </p>         
          { renderCards() }
        </ul>
      </div>
    );
  }
}
