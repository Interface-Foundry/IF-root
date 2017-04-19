import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Item extends Component {
  state = {
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
    amazon_id: PropTypes.string
  }

  componentWillMount() {
    const { props: { item_id, amazon_id, previewAmazonItem, previewItem, item, type, items, fetchDeals } } = this;
    // only update item if there isn't one
    if (!item.price) {
      if (item_id) previewItem(item_id);
      else if (amazon_id) previewAmazonItem(amazon_id);
    }

    if (type === 'deal' && items.length === 0) fetchDeals();
    this.determineNav = ::this.determineNav;
  }

  componentWillReceiveProps(nextProps) {
    const { props: { item_id, amazon_id, previewItem, previewAmazonItem } } = this;

    if (nextProps.item_id !== item_id) previewItem(nextProps.item_id);
    else if (nextProps.amazon_id !== amazon_id) previewAmazonItem(nextProps.amazon_id);
  }

  componentWillUnmount() {
    const { props: { clearItem } } = this;
    clearItem();
  }

  determineNav() {
    const {
      props: { cart_id, type, items, index, history: { replace } },
      state: { originalx, x }
    } = this;
    if (type === 'deal') {
      const numericInt = parseInt(index),
        diff = Math.abs(originalx - x),
        newIndex = originalx > x ? (numericInt === items.length - 1 ? 0 : numericInt + 1) : (numericInt === 0 ? items.length - 1 : numericInt - 1);

      if (originalx !== x && x !== 0 && diff > 100) replace(`/cart/${cart_id}/m/${type}/${newIndex}/${items[newIndex].asin}`);
    }
  }

  render() {
    const {
      determineNav,
      props,
      props: { index, type, items, item, item: { main_image_url, store, description } }
    } = this;

    return (
      <div 
        className='item' onTouchStart={(e) => this.setState({ originalx: e.changedTouches[e.changedTouches.length - 1].pageX }) }
        onTouchMove={ (e) => this.setState({ x: e.changedTouches[e.changedTouches.length - 1].pageX }) }
        onTouchEnd={ () => determineNav() }
        >
        <div className='item__view__image image row'
            style={ { backgroundImage: `url(${main_image_url})`, height: 150 } }>
        </div>
        <div className='item__view__atts'>
          <p>{name}</p>
        </div>
        { 
          type === 'deal' && items[parseInt(index)]
          ? <DealInfo deal={items[parseInt(index)]} item={item}/> 
          : <ItemInfo {...props} {...item} /> 
        }
        <div className='item__view__description'>
          <h4>{store}</h4> 
          <p className='ellipsis' > { description }</p>
          <a> View more </a>
        </div> 
        <div className='item__view__review'>
          <p className='ellipsis'>{description}</p>
          <em > -theGodOfIpsum </em>
        </div>
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
    const convertedPrice = price ? price.toFixed(2) : '0.00',
      convertedPrevPrice = previousPrice ? previousPrice.toFixed(2) : '0.00',
      convertedPercent = savePercent ? (savePercent * 100)
      .toFixed() : '0';
    return (
      <div className = 'deal__view__price' >
        <h4>${convertedPrice}</h4> 
        <p><strike>${convertedPrevPrice}</strike> ({convertedPercent}% off)</p>
      </div>
    );
  }
}

class ItemInfo extends Component {
  static propTypes = {
    name: PropTypes.string,
    price: PropTypes.number
  };

  render() {
    const { props, props: { price } } = this;
    const convertedPrice = price ? price.toFixed(2) : '0.00';
    return (
      <div className='item__view__price' >
        <h4>${convertedPrice}</h4> 
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
    const { item: { id, quantity }, incrementItem, decrementItem } = this.props;
    return (
      <div className='item__view__quantity'>
        <button onClick={()=>incrementItem(id, quantity)}>+</button>
        <div className='item__view__quantity__num'>{quantity}</div>
        {
          (quantity > 1) 
            ? <button onClick={()=> decrementItem(id, quantity)}>-</button>
            : <div className='item__view__quantity__placeholder'/>
        } 
      </div>
    );
  }
}
