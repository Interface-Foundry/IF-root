// // mint/react/components/Cart/Item.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { displayCost } from '../../utils';
import { splitCartById } from '../../reducers';
import { RouteTransition } from 'react-router-transition';
import Icon from '../Icon';
import * as presets from '../../styles/RouteAnimations';

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
    if (!item.price) {
      if (item_id) previewItem(item_id);
      else if (amazon_id) previewAmazonItem(amazon_id);
    }

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
        selectDeal(newIndex);
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
      props: { index, type, items, item, nextSearch, prevSearch, location: { pathname }, item: { main_image_url, description, name, asin } }
    } = this,
    // TODO: replace this with the server url!
    tempUrl = `https://amazon.com/dp/${asin}/`;

    const imageUrl = (items[parseInt(index)] && items[parseInt(index)].large)
      ? items[parseInt(index)].large
      : main_image_url;
    return (
      <div className='item'>
        <RouteTransition
          className="item__transition"
          pathname={pathname}
          {...presets.default[animation]}>
          <div className='item__view__image image row'
              onTouchStart={(e) => this.setState({ originalx: e.changedTouches[e.changedTouches.length - 1].pageX }) }
              onTouchMove={ (e) => this.setState({ x: e.changedTouches[e.changedTouches.length - 1].pageX }) }
              onTouchEnd={ () => determineNav() }
              style={ { backgroundImage: `url(${imageUrl})`, height: 150 } }>
          </div>
          <div className='item__view__atts'>
            <p>{name}</p>
          </div>
          { 
            type === 'deal' && items[parseInt(index)]
            ? <DealInfo deal={items[parseInt(index)]} item={item}/> 
            : <ItemInfo {...props} {...item} />
          }
          {
          item.search 
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
          <a href={tempUrl} target='_blank' className='item__view__amazon__link'> <Icon icon='Open'/> View on Amazon </a>
        </RouteTransition>
      </div>
    );
  }
}

class ProductDescription extends Component {
  constructor(props) {
    super(props);
    this.toggleDescrip = ::this.toggleDescrip;
    this._handleWindowResize = ::this._handleWindowResize;
  }

  state = {
    descripHeight: '100%',
    descripTall: false,
    showViewMore: true
  }

  static propTypes = {
    description: PropTypes.string
  }

  toggleDescrip() {
    const { state: { descripTall } } = this;
    this.setState({
      descripHeight: descripTall ? 60 : '100%',
      descripTall: !descripTall
    });
  }

  _handleWindowResize() {
    const height = this.refs.descrip.clientHeight;

    this.setState({
      showViewMore: height > 80,
      descripHeight: height > 80 ? 60 : '100%'
    });
  }

  componentDidMount() {
    this._handleWindowResize()
    window.addEventListener('resize', this._handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._handleWindowResize);
  }
  
  componentDidUpdate(nextProps) {
    if(nextProps.description !== this.props.description)
      this._handleWindowResize()
  }

  render() {
    const { toggleDescrip, state: { descripHeight, descripTall, showViewMore }, props: { description } } = this;

    return (
      <div ref='descrip' className='item__view__description'>
        <p className='ellipsis' style={{maxHeight: descripHeight}}> { description }</p>
        {
          (showViewMore)
            ? <div className='fadeover' style={{display: descripTall ? 'none' : 'block'}}/>
            : null
        }
        {
          (showViewMore) 
          ? <a href='#' onClick={toggleDescrip}> View {descripTall ? 'less' : 'more'} </a> 
          : null
        }
      </div>
    );
  }
}

class DealInfo extends Component {
  static propTypes = {
    item: PropTypes.object,
    deal: PropTypes.object
  }
  render() {
    const { deal: { price, previousPrice, savePercent } } = this.props;
    // make sure item and deal are defined
    const convertedPrice = price ? displayCost(price) : '0.00',
      convertedPrevPrice = previousPrice ? displayCost(previousPrice) : '0.00',
      convertedPercent = savePercent ? (savePercent * 100)
      .toFixed() : '0';
    return (
      <div className = 'deal__view__price' >
        <div>
          <h4>Price: <span>{convertedPrice}</span></h4>
          <h5><strike>{convertedPrevPrice}</strike> ({convertedPercent}% off)</h5>
        </div>
      </div>
    );
  }
}

class ItemInfo extends Component {
  static propTypes = {
    name: PropTypes.string,
    price: PropTypes.number,
    quantity: PropTypes.number
  };

  render() {
    const { props, props: { price, quantity } } = this;
    const convertedPrice = price ? displayCost(price) : '0.00';
    const total = displayCost(price * quantity);
    return (
      <div className='item__view__price'>
        <div>
          {quantity>1? <h5>Price: {convertedPrice}</h5>:null}
          <h4>Total: <span>{total}</span></h4>
        </div>
        <AddRemove {...props} />
      </div>
    );
  }
}

class AddRemove extends Component {
  static propTypes = {
    item: PropTypes.object,
    incrementItem: PropTypes.func,
    decrementItem: PropTypes.func,
  }
  render() {
    const { item: { id, quantity, added_by }, incrementItem, decrementItem } = this.props;
    return (!added_by
      ? null
      : <div className='item__view__quantity'>
            <button onClick={()=>incrementItem(id, quantity)}>+</button>
            <div className='item__view__quantity__num'>{quantity}</div>
            {
              <button disabled={!(quantity > 1)} onClick={()=> decrementItem(id, quantity)}>-</button>
            } 
          </div>
    );
  }
}
