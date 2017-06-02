// react/components/Cards/Cards.js

import PropTypes from 'prop-types';
import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import CategoryCard from './CategoryCard';
import SearchCard from './SearchCard';
import { getLastSearch } from '../../utils';
import { Icon } from '../../../react-common/components';

export default class Cards extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
    this._scrollHorizontal = ::this._scrollHorizontal;
  }

  static propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    cart_id: PropTypes.string,
    selectDeal: PropTypes.func,
    cardType: PropTypes.string,
    selectCard: PropTypes.func,
    previewAmazonItem: PropTypes.func,
    position: PropTypes.number,
    clearItem: PropTypes.func,
    storeName: PropTypes.string,
    currentCart: PropTypes.object
  }

  state = {
    hide: 'left'
  }

  _scrollHorizontal(direction) {
    clearInterval(this.scrollInterval);

    let end, cosParameter, scrollMargin,
      scrollCount = 0,
      scrollStep = Math.PI / (2000 / 15);

    const element = ReactDOM.findDOMNode(this.refs.scroll)

    switch (direction) {
    case 'left':
      end = element.scrollLeft - 600 > 1 ? element.scrollLeft - 600 : 1;
      cosParameter = end / 2;

      this.scrollInterval = setInterval(() => {
        if (element.scrollLeft >= end) {
          scrollCount = scrollCount + 1;
          scrollMargin = cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
          element.scrollLeft = element.scrollLeft - scrollMargin;
        } else {
          clearInterval(this.scrollInterval);
        }
      }, 5);

      break;
    case 'right':
      end = element.scrollLeft + 600;
      cosParameter = end / 2;

      this.scrollInterval = setInterval(() => {
        if (element.scrollLeft <= end) {
          scrollCount = scrollCount + 1;
          scrollMargin = cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
          element.scrollLeft = element.scrollLeft + scrollMargin;
        } else {
          clearInterval(this.scrollInterval);
        }
      }, 5);

      break;
    }
  }

  renderCards() {
    const { props: { currentCart, cards = [], cart_id, selectCard, cardType, previewAmazonItem } } = this;

    const activeCards = cards.map((card, i) => {
      return <li key={card._id || card.id} onClick={(e) => selectCard(i + 1, card)}>
        {
          cardType.includes('search')  ? <SearchCard {...card} currentCart={currentCart} cart_id={cart_id} index={i}/> : <CategoryCard {...card} cart_id={cart_id} currentCart={currentCart} index={i} previewAmazonItem={previewAmazonItem}/>
        }
      </li>;
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
    const { renderCards, _scrollHorizontal, props: { cardType, clearItem, storeName } } = this,
    type = cardType || 'categories';

    return (
      <div>
        <ul ref='cards' className={'cards__section'}>
          {
            storeName === 'ypo' ? <p className='cards__section__breadcrumb'>
              <span className={`cards__section__breadcrumb-type ${type.includes('search') ? 'yellow' : ''}`} onClick={() => clearItem()}>
                {type.includes('search') ? <Icon icon='LeftChevron'/> : _.capitalize(type.split('-search')[0])}
              </span> 
              { 
                type.includes('search') ? <em>
                &nbsp;
                <span>
                  {`${getLastSearch()}`}
                </span> </em> : null
              }
            </p> : null
          }
          <div className='icon left' onClick={() => {
            _scrollHorizontal('left');
          }}>
            <Icon icon='LeftChevron'/>
          </div> 
          { renderCards() }
          <div className='icon right'
            onClick={() => {
              _scrollHorizontal('right');
            }}>
            <Icon icon='RightChevron'/>
          </div>
        </ul>
      </div>
    );
  }
}
