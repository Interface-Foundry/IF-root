// react/components/Cards/Cards.js

import PropTypes from 'prop-types';
import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import CategoryCard from './CategoryCard';
import SearchCard from './SearchCard';
import { getLastSearch } from '../../utils';
import { Icon } from '..';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

export default class Cards extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
    this._scrollHorizontal = :: this._scrollHorizontal;
  }

  static propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    cart_id: PropTypes.string,
    selectDeal: PropTypes.func
  }

  _scrollHorizontal(direction) {
    clearInterval(this.scrollInterval); 

    let end, cosParameter, scrollMargin,
      scrollCount = 0,
      scrollStep = Math.PI / ( 2000 / 15 );

    const element = ReactDOM.findDOMNode(this.refs.scroll)

    switch (direction) {
      case 'left':
        end = element.scrollLeft - 600 > 2 ? element.scrollLeft - 600 : 2;
        cosParameter = end / 2;

        this.scrollInterval = setInterval(() => {
          if ( element.scrollLeft >= end ) {
            scrollCount = scrollCount + 1;
            scrollMargin =  cosParameter - cosParameter * Math.cos( scrollCount * scrollStep );
            element.scrollLeft = element.scrollLeft - scrollMargin;
          } 
          else {
            clearInterval(this.scrollInterval); 
          }
        }, 15);
        break;
      case 'right':
        end = element.scrollLeft + 600 < element.firstElementChild.clientWidth ? element.scrollLeft + 600 : element.firstElementChild.clientWidth;
        cosParameter = end / 2;

        this.scrollInterval = setInterval(() => {
          if ( element.scrollLeft <= end ) {
            scrollCount = scrollCount + 1;
            scrollMargin =  cosParameter - cosParameter * Math.cos( scrollCount * scrollStep );
            element.scrollLeft = element.scrollLeft + scrollMargin;
          } 
          else {
            clearInterval(this.scrollInterval); 
          }
        }, 15);
        break;
    }
  }

  shouldComponentUpdate (nextProps, nextState){
    if(nextProps.cards.length !== this.props.cards.length || nextProps.cardType !== this.props.cardType) return true;

    return false;
  }


  renderCards() {
    const { props: { cards, cart_id, selectCard, cardType, previewAmazonItem }} = this;

    const activeCards = cards.map((card, i) => {
      return <li key={card.id} onClick={(e) => selectCard(i + 1, card)}>
        {
          cardType.includes('search')  ? <SearchCard {...card} cart_id={cart_id} index={i}/> : <CategoryCard {...card} cart_id={cart_id} index={i} previewAmazonItem={previewAmazonItem}/>
        }
      </li>
    });

    return (
      <div ref='scroll' className='scroll__horizontal'>
        <span>
          {activeCards}
        </span>
      </div>
    );
  }

  render() {
    const { renderCards, _scrollHorizontal, props: { cardType, position, cards, clearItem }} = this,
      type = cardType || 'categories';

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
          <div className='icon left' onClick={() => {
            _scrollHorizontal('left')
          }}>
            <Icon icon='LeftChevron'/>
          </div> 
          { renderCards() }
          <div className='icon right'onClick={() => {
            _scrollHorizontal('right')
          }}>
            <Icon icon='RightChevron'/>
          </div>
        </ul>
      </div>
    );
  }
}
