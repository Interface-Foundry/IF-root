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
      props: { item_id, amazon_id, previewAmazonItem, previewItem, type, item, items, index, setSearchIndex, fetchDeals }
    } = this;
    // only update item if there isn't one
    if (item_id) previewItem(item_id);
    else if (amazon_id) previewAmazonItem(amazon_id);

    if (type === 'deal' && items.length === 0) fetchDeals();
    else if (type === 'search' && index && item.length) setSearchIndex(index);
    this.determineNav = ::this.determineNav;
  }

  componentWillReceiveProps(nextProps) {
    const { props: { cart_id, item_id, amazon_id, previewItem, previewAmazonItem, history: { replace } } } = this;
    const { type: nextType, item: nextItem, index: nextIndex, item: { position: nextPos } } = nextProps;
    //never replace cart_id if its undefined
    if (cart_id && nextType === 'item' && Array.isArray(nextItem.search)) {
      replace(`/cart/${cart_id}/m/search/${nextItem.position}/${amazon_id}`);
    } else if (cart_id && nextType === 'search' && nextPos !== nextIndex && nextItem.search.length) {
      replace(`/cart/${cart_id}/m/${nextType}/${nextPos || 0}/${amazon_id}`);
    } else if (cart_id && nextType === 'search' && !nextItem.search.length) {
      replace(`/cart/${cart_id}?toast=No Search Results 😅&status=err`);
    } else if (nextProps.item_id !== item_id) {
      previewItem(nextProps.item_id);
    } else if (nextProps.amazon_id !== amazon_id) {
      previewAmazonItem(nextProps.amazon_id);
    }
  }

  componentWillUnmount() {
    const { props: { clearItem } } = this;
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
    const { clearItem, cart_id, type, items, selectDeal, history: { replace } } = this.props;
    clearItem();
    selectDeal(newIndex, items[newIndex]);
    replace(`/cart/${cart_id}/m/${type}/${newIndex}/${items[newIndex].asin}`);
  }

  navSearch() {
    const { state: { originalx, x }, props: { clearItem, nextSearch, prevSearch } } = this,
    nav = (originalx > x) ? nextSearch : prevSearch;
    clearItem();
    nav();
  }

  navCart(newIndex) {
    const { clearItem, cart_id, type, currentUser: { id }, history: { replace } } = this.props;
    const ourItems = splitCartById(this.props, { id });
    clearItem();
    replace(`/cart/${cart_id}/m/${type}/${newIndex}/${ourItems.my[newIndex].id}/edit`);
  }

  render() {
    const { determineNav, props, state: { animation }, props: { index, type, items, item, nextSearch, prevSearch, location: { pathname }, history: { replace }, item: { main_image_url, description, name, asin, options, iframe_review_url } } } = this;
    const imageUrl = (items[parseInt(index)] && items[parseInt(index)].large)
      ? items[parseInt(index)].large
      : main_image_url,
      next = () => {
        this.setState({ animation: 'slideLeft' });
        if (type === 'search') return nextSearch();
        const newIndex = (index === items.length - 1) ? 0 : index + 1;
        if (type === 'deal')::this.navDeal(newIndex);
        else if (type === 'cartItem')::this.navCart(newIndex);
      },
      prev = () => {
        this.setState({ animation: 'slideRight' });
        if (type === 'search') return prevSearch();
        const newIndex = (index === 0) ? items.length - 1 : index - 1;
        if (type === 'deal')::this.navDeal(newIndex);
        else if (type === 'cartItem')::this.navCart(newIndex);
      },
      showButton = type === 'deal' || type === 'search' || type === 'cartItem';

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
              {showButton ? <button onClick={()=>prev()}>&lt;</button> : null}
              <div className='item__info__wrapper'>
                <div className='item__view__image image row'
                    style={ { backgroundImage: `url(${imageUrl})`, height: 150 } }>
                </div>
                <div className='item__view__atts'>
                  <p>{name}</p>
                </div>
              </div>
              {showButton ? <button onClick={()=>next()}>&gt;</button> : null}
            </div>
            { 
              type === 'deal' && items[parseInt(index)]
              ? <DealInfo deal={items[parseInt(index)]} item={item}/> 
              : <ItemInfo {...props} {...item} />
            }
            <ProductDescription description={description} />
            {iframe_review_url ? <iframe className='review__iframe' src={iframe_review_url}/> : null}
            <a href={`/api/item/${item.id}/clickthrough`} target='_blank' className='item__view__amazon__link'> <Icon icon='Open'/> View on Amazon </a>
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
