// mint/react/components/Cart/Item.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { splitCartById } from '../../reducers';
import { RouteTransition } from 'react-router-transition';
import Icon from '../Icon';
import * as presets from '../../styles/RouteAnimations';
import ItemVariationSelector from './ItemVariationSelector';
import ProductDescription from './ProductDescription';
import DealInfo from './DealInfo';
import ItemInfo from './ItemInfo';

export default class Item extends Component {
  state = {
    animation: 'slideLeft',
    originalx: 0,
    x: 0
  }

  static propTypes = {
    item_id: PropTypes.string,
    item: PropTypes.object,
    previewItem: PropTypes.func.isRequired,
    clearItem: PropTypes.func.isRequired,
    cart_id: PropTypes.string,
    history: PropTypes.object.isRequired,
    type: PropTypes.string,
    items: PropTypes.array,
    fetchDeals: PropTypes.func,
    previewAmazonItem: PropTypes.func,
    index: PropTypes.number,
    amazon_id: PropTypes.string,
    nextSearch: PropTypes.func,
    prevSearch: PropTypes.func,
    setSearchIndex: PropTypes.func,
    location: PropTypes.object,
    selectDeal: PropTypes.func,
    currentUser: PropTypes.object
  }

  componentWillMount() {
    const {
      props: { item_id, amazon_id, previewAmazonItem, previewItem, item, type, items, index, setSearchIndex, fetchDeals }
    } = this;
    // only update item if there isn't one
    if (item_id) previewItem(item_id);
    else if (amazon_id) previewAmazonItem(amazon_id);

    if (type === 'deal' && items.length === 0) fetchDeals();
    else if (type === 'search' && index) setSearchIndex(index);
    this.determineNav = ::this.determineNav;
  }

  componentWillReceiveProps(nextProps) {
    const {
      props: { cart_id, item_id, amazon_id, previewItem, previewAmazonItem, history: { replace } }
    } = this;
    const { type: nextType, item: nextItem, index: nextIndex, item: { position: nextPos } } = nextProps;
    //never replace cart_id if its undefined
    if (cart_id && nextType === 'item' && Array.isArray(nextItem.search)) replace(`/cart/${cart_id}/m/search/${nextItem.position}/${amazon_id}`);
    else if (cart_id && nextType === 'search' && nextPos !== nextIndex) replace(`/cart/${cart_id}/m/${nextType}/${nextPos || 0}/${amazon_id}`);
    else if (nextProps.item_id !== item_id) previewItem(nextProps.item_id);
    else if (nextProps.amazon_id !== amazon_id) previewAmazonItem(nextProps.amazon_id);
  }

  componentWillUnmount() {
    const { props: { clearItem } } = this;
    clearItem();
  }

  determineNav() {
    const {
      props: { selectDeal, cart_id, type, items, index, nextSearch, prevSearch, currentUser, history: { replace } },
      state: { originalx, x }
    } = this;

    if (x > originalx) this.setState({ animation: 'slideRight' });
    else this.setState({ animation: 'slideLeft' });

    if (type === 'deal') {
      const numericInt = parseInt(index),
        abs = Math.abs(originalx - x),
        newIndex = originalx > x
        ? (numericInt === items.length - 1 ? 0 : numericInt + 1)
        : (numericInt === 0 ? items.length - 1 : numericInt - 1);
      if (originalx !== x && x !== 0 && abs > 100) {
        selectDeal(newIndex, items[newIndex]);
        replace(`/cart/${cart_id}/m/${type}/${newIndex}/${items[newIndex].asin}`);
      }
    } else if (type === 'search') {
      const abs = Math.abs(originalx - x),
        nav = originalx > x ? nextSearch : prevSearch;
      if (originalx !== x && x !== 0 && abs > 100 && type === 'search') nav();
    } else if (type === 'cartItem') {
      const numericInt = parseInt(index),
        abs = Math.abs(originalx - x),
        newIndex = originalx > x
        ? (numericInt === items.length - 1
          ? 0
          : numericInt + 1)
        : (numericInt === 0 ? items.length - 1
          : numericInt - 1);

      const ourItems = splitCartById(this.props, { id: currentUser.id })
        .my;

      if (originalx !== x && x !== 0 && abs > 100) replace(`/cart/${cart_id}/m/${type}/${newIndex}/${ourItems[newIndex].id}/edit`);
    }
  }

  render() {
    const {
      determineNav,
      props,
      state: { animation },
      props: { index, type, items, item, nextSearch, prevSearch, item_id, location: { pathname }, history: { replace }, item: { main_image_url, description, name, asin, search, options } }
    } = this,
    amazonLink = `/api/item/${item.id}/clickthrough`;
    const imageUrl = (items[parseInt(index)] && items[parseInt(index)].large)
      ? items[parseInt(index)].large
      : main_image_url;

    return (
      <div className='item_container'>
        <div className='item'>
          <RouteTransition
            className="item__transition"
            pathname={pathname}
            {...presets.default[animation]}>
            <div className='item__nav_wrapper'
                onTouchStart={(e) => this.setState({ originalx: e.changedTouches[e.changedTouches.length - 1].pageX }) }
                onTouchMove={ (e) => this.setState({ x: e.changedTouches[e.changedTouches.length - 1].pageX }) }
                onTouchEnd={ () => determineNav() }
            >
              <div className='item__view__image image row'
                  style={ { backgroundImage: `url(${main_image_url})`, height: 150 } }>
              </div>
              <div className='item__view__atts'>
                <p>{name}</p>
              </div>
            </div>
            { 
              type === 'deal' && items[parseInt(index)]
              ? <DealInfo deal={items[parseInt(index)]} item={item}/> 
              : <ItemInfo {...props} {...item} />
            }
            {
            search 
                ? <div>
                    <button onClick={()=>prevSearch()}>&lt;</button>
                    <button onClick={()=>nextSearch()}>&gt;</button>
                  </div>
                : null
                } 
            <ProductDescription description={description} />
            <div className='item__view__review'>
              {/* TODO: get reviews in here */}
              <p className='ellipsis'>This thing is great! Almost as good as penguin food</p>
              <em > -Definitely not a penguin </em>
            </div>
            <a href={amazonLink} target='_blank' className='item__view__amazon__link'> <Icon icon='Open'/> View on Amazon </a>
            
          </RouteTransition>
        </div>
        {
          (options && options.length)
          ? <ItemVariationSelector replace={replace} options={options} defaultVal={asin} {...props} /> 
          : null
        }
      </div>
    );
  }
}
