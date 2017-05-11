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
    fetchCards: PropTypes.func,
    previewAmazonItem: PropTypes.func,
    index: PropTypes.number,
    amazon_id: PropTypes.string,
    nextSearch: PropTypes.func,
    prevSearch: PropTypes.func,
    setSearchIndex: PropTypes.func,
    location: PropTypes.object,
    selectCard: PropTypes.func,
    currentUser: PropTypes.object,
    currentCart: PropTypes.object
  }

  componentWillMount() {
    const {
      props: { item_id, amazon_id, previewAmazonItem, previewItem, type, item, items, index, setSearchIndex, fetchCards }
    } = this;
    // only update item if there isn't one
    if (item_id) previewItem(item_id);
    else if (amazon_id) previewAmazonItem(amazon_id);

    if (type === 'deal' && items.length === 0) fetchCards();
    else if (type === 'search' && index && item.length) setSearchIndex(index);
    this.determineNav = ::this.determineNav;
  }

  componentWillReceiveProps(nextProps) {
    const { props: { cart_id, item_id, amazon_id, previewItem, previewAmazonItem, history: { replace, push } } } = this;
    const { type: nextType, item: nextItem, index: nextIndex, item_id: nextId, item: { position: nextPos } } = nextProps;
    //never replace cart_id if its undefined
    if (cart_id && nextType === 'item' && Array.isArray(nextItem.search)) {
      push(`/cart/${cart_id}/m/search/${nextItem.position}/${amazon_id}`);
    } else if (cart_id && nextType === 'search' && nextPos !== nextIndex && nextItem.search.length) {
      push(`/cart/${cart_id}/m/${nextType}/${nextPos || 0}/${amazon_id}`);
    } else if (cart_id && nextType === 'search' && !nextItem.search.length) {
      push(`/cart/${cart_id}?toast=No Search Results 😅&status=err`);
    } else if (nextId !== item_id) {
      previewItem(nextProps.item_id);
    } else if (nextProps.amazon_id !== amazon_id) {
      previewAmazonItem(nextProps.amazon_id);
    }
  }

  componentWillUnmount() {
    const { clearItem } = this.props;
    clearItem();
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
      else if (type === 'cartItem')::this.navCart(newIndex);
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
      currentUser: { id },
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
        item: { main_image_url, description, name, asin, options, iframe_review_url },
        currentCart: { leader },
        currentUser: { id },
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
        else if (type === 'cartItem')::this.navCart(newIndex);
      },
      prev = () => {
        this.setState({ animation: 'slideRight' });
        if (type === 'search') return prevSearch();
        const newIndex = (index <= 0) ? items.length - 1 : index - 1;
        if (type === 'deal')::this.navDeal(newIndex);
        else if (type === 'cartItem')::this.navCart(newIndex);
      },
      showButton = type === 'deal' || type === 'search' || (type === 'cartItem' && myItems.length > 1);

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
            ? <ItemVariationSelector replace={replace} options={options} defaultVal={asin} {...props} /> 
            : null
          }
        </div>
    );
  }
}
