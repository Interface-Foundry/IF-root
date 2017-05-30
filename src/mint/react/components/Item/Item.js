// mint/react/components/Cart/Item.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { splitCartById } from '../../reducers';
import { RouteTransition } from 'react-router-transition';
import { Icon } from '../../../react-common/components';
import * as presets from '../../../react-common/styles/RouteAnimations';
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
    fetchCards: PropTypes.func,
    search: PropTypes.func,
    index: PropTypes.number,
    amazon_id: PropTypes.string,
    nextSearch: PropTypes.func,
    prevSearch: PropTypes.func,
    setSearchIndex: PropTypes.func,
    location: PropTypes.object,
    selectCard: PropTypes.func,
    user_account: PropTypes.object,
    currentCart: PropTypes.object,
    store: PropTypes.object,
    search: PropTypes.string,
    saveOldId: PropTypes.func
  }

  determineNav() {
    const {
      props: { type, index, items },
      state: { originalx, x }
    } = this;

    if (x > originalx) this.setState({ animation: 'slideRight' });
    else this.setState({ animation: 'slideLeft' });

    const abs = Math.abs(originalx - x),
      pageIndex = parseInt(index),
      navOk = (originalx !== x && x !== 0 && abs > 100);
    if (navOk) {
      if (type === 'search') return ::this.navSearch();
      const newIndex = (originalx > x) // we don't need this if its a search
        ? (pageIndex === items.length - 1) ? 0 : pageIndex + 1
        : (pageIndex === 0) ? items.length - 1 : pageIndex - 1;
      if (type === 'deal')::this.navDeal(newIndex); //look ma, no constructor!
      else if (type === 'cartItem' || type === 'cartVariant')::this.navCart(newIndex);
    }
  }

  navDeal(newIndex) {
    const { cart_id, type, items, selectCard, history: { replace } } = this.props;
    selectCard(newIndex, items[newIndex]);
    replace(`/cart/${cart_id}/m/${type}/${newIndex}/${items[newIndex].asin}`);
  }

  navSearch() {
    const { state: { originalx, x }, props: { nextSearch, prevSearch } } = this,
    nav = (originalx > x) ? nextSearch : prevSearch;
    nav();
  }

  navCart(newIndex) {
    const {
      cart_id,
      type,
      items,
      user_account: { id },
      currentCart: { leader: { id: leaderId } },
      history: { replace }
    } = this.props;
    const splitItems = splitCartById(this.props, { id });
    const myItems = id !== leaderId
      ? splitItems.my
      : items;
    let ind = newIndex > myItems.length - 1
      ? 0
      : newIndex < 0
      ? myItems.length - 1
      : newIndex;
    replace(`/cart/${cart_id}/m/${type}/${ind}/${myItems[ind].id}/edit`);
  }

  componentWillMount() {
    const { props: { item_id, amazon_id, search, cart_id, previewItem, type, item, items, index, setSearchIndex, currentCart, fetchCards } } = this;

    if (!item && !items || (type === 'cartVariant' || type === 'cartItem' || type === 'cartVariant' || type === 'cartView')) {
      if (type === 'search' && index) setSearchIndex(index);
      else if (amazon_id && currentCart.store) search(amazon_id, currentCart.store, currentCart.store_locale);
      else if (currentCart.store) previewItem(item_id);
      else if (type === 'card' && currentCart.store === 'ypo') fetchCards(cart_id);
    }
    this.determineNav = ::this.determineNav;
  }

  componentWillReceiveProps(nextProps) {
    const {
      props: {
        cart_id,
        item_id,
        previewItem,
        search,
        saveOldId,
        amazon_id,
        history: { push },
        item: { asin, options }
      }
    } = this;
    const {
      type: nextType,
      items: nextItems,
      index: nextIndex,
      search: nextSearch,
      amazon_id: nextAmazonId,
      item: { position: nextPos, asin: nextAsin, id: nextId },
      currentCart: { store: nextStore, store_locale: nextLocale },
    } = nextProps;

    if (cart_id && nextType === 'item' && Array.isArray(nextSearch)) { //never replace cart_id if its undefined
      push(`/cart/${cart_id}/m/search/${nextPos}/${nextAsin}`);
    } else if (cart_id && nextType === 'search' && nextPos !== nextIndex && nextItems.length) {
      push(`/cart/${cart_id}/m/${nextType}/${nextPos || 0}/${nextAsin}`);
    } else if (cart_id && nextType === 'search' && !nextItems.length) {
      push(`/cart/${cart_id}?toast=No Search Results 😅&status=err`);
    } else if (nextId !== item_id && nextId && !options) {
      previewItem(nextId);
    } else if (nextStore && amazon_id !== nextAmazonId) {
      saveOldId(item_id);
      search(nextAmazonId, nextStore, nextLocale);
    }
  }
  componentWillUnmount() {
    const { clearItem } = this.props;
    clearItem();
  }

  render() {
    const {
      determineNav,
      props,
      state: { animation },
      props: {
        index,
        type,
        items,
        item,
        nextSearch,
        prevSearch,
        location: { pathname },
        history: { replace },
        currentCart: { leader },
        user_account: { id },
        item: { description, name, options, iframe_review_url, main_image_url, asin } = item
      }
    } = this;
    const splitItems = splitCartById(this.props, { id });
    const myItems = leader && id !== leader.id
      ? splitItems.my
      : items;
    let imageUrl =
      (items[parseInt(index)] && items[parseInt(index)].large)
      ? items[parseInt(index)].large
      : main_image_url,
      next = () => {
        this.setState({ animation: 'slideLeft' });
        if (type === 'search') return nextSearch();
        const newIndex = (index >= items.length - 1) ? 0 : index + 1;
        if (type === 'deal')::this.navDeal(newIndex);
        else if (type === 'cartItem' || type === 'cartVariant')::this.navCart(newIndex);
      },
      prev = () => {
        this.setState({ animation: 'slideRight' });
        if (type === 'search') return prevSearch();
        const newIndex = (index <= 0) ? items.length - 1 : index - 1;
        if (type === 'deal')::this.navDeal(newIndex);
        else if (type === 'cartItem' || type === 'cartVariant')::this.navCart(newIndex);
      },
      showButton = type === 'deal' || type === 'search' || (type === 'cartItem' || type === 'cartVariant' && myItems.length > 1);

    if (!imageUrl) return (
      <div className='placeholder' src='//storage.googleapis.com/kip-random/head_smaller.png'>
        <div className='mask top' />
        <div className='mask left photo' />
        <div className='mask right photo' />
        <div className='mask middle' />
        <div className='mask mid l1 text' />
        <div className='mask mid l2 text' />
        <div className='mask left text' />
        <div className='mask right text' />
      </div>
    );
    else return (
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
                {showButton ? <button onClick={()=>prev()}>&lt;</button> : null}
                <div className='item__info__wrapper'>
                  <div className={'item__view__image image row'}
                      style={ { backgroundImage: `url(${imageUrl})` } }>
                  </div>
                  <div className='item__view__atts'>
                    <p>{name}</p>
                  </div>
                </div>
                {showButton ? <button onClick={()=> next()}>&gt;</button> : null}
              </div>
              { 
                type === 'deal' && items[parseInt(index)]
                ? <DealInfo deal={items[parseInt(index)]} item={item}/> 
                : <ItemInfo {...props} {...item} />
              }
              <ProductDescription description={description} />
              {
                iframe_review_url 
                  ? <iframe className='review__iframe' src={iframe_review_url}/>
                  : null
              }
              {
              item.id 
                ? <a href={`/api/item/${item.id}/clickthrough`} target='_blank' className='item__view__amazon__link'> 
                    <Icon icon='Open'/> View on Amazon 
                  </a>
                : null
              }
            </RouteTransition>
          </div>
          {
            (options && options.length)
            ? <ItemVariationSelector replace={replace} options={options} defaultVal={asin} inCart={type==='cartItem'||type==='cartVariant'} {...props} /> 
            : null
          }
        </div>
    );
  }
}