import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Item extends Component {
  state = {
    originalx: 0,
    x: 0
  }

  static propTypes = {
    item_id: PropTypes.string.isRequired,
    item: PropTypes.object,
    previewItem: PropTypes.func.isRequired,
    clearItem: PropTypes.func.isRequired,
    cart_id: PropTypes.string,
    history: PropTypes.object.isRequired,
    type: PropTypes.string,
    items: PropTypes.array,
    fetchDeals: PropTypes.func,
    index: PropTypes.number
  }

  componentWillMount() {
    const { props: { item_id, previewItem, item, type, items, fetchDeals } } = this;
    // only update item if there isn't one
    if (item_id && !item.price) previewItem(item_id);

    if (type === 'deal' && items.length === 0) fetchDeals();
  }

  componentWillReceiveProps(nextProps) {
    const { props: { item_id, previewItem } } = this;

    if (nextProps.item_id !== item_id)
      previewItem(nextProps.item_id);
  }

  componentWillUnmount() {
    const { props: { clearItem } } = this;
    clearItem();
  }

  _handleSwipe = (x) => {
    this.setState({ x })
  }

  render() {
    const {
      props: {
        cart_id,
        type,
        items,
        index,
        item,
        item: { name, main_image_url, price, store, description },
        history: { replace }
      },
      state: {
        originalx,
        x
      }
    } = this;

    return ( 
    <div 
      className='item'
      onTouchStart={
        (e) => this.setState({ originalx: e.changedTouches[e.changedTouches.length - 1].pageX }) }
      onTouchMove={
        (e) => this.setState({ x: e.changedTouches[e.changedTouches.length - 1].pageX }) }
      onTouchEnd={
        (e) => {
          if (type === 'deal') {
            const numericInt = parseInt(index),
              diff = Math.abs(originalx - x),
              newIndex = originalx > x ? (numericInt === items.length - 1 ? 0 : numericInt + 1) : (numericInt === 0 ? items.length - 1 : numericInt - 1);

            if (originalx !== x && x !== 0 && diff > 100) replace(`/cart/${cart_id}/m/${type}/${newIndex}/${items[newIndex].asin}`);
          }
        }
      }>
        <div className='item__view__image image row'
            style={ { backgroundImage: `url(${main_image_url})`, height: 150 } }>
        </div>
        <div className = 'item__view__atts' >
          <p>Item: {name}</p>
        </div>
        <div className = 'item__view__price'>
          <h4>${price}</h4> 
          <p>
            Price: <span>${price + 40}</span> ($40 off)
          </p>
        </div>
        <div className = 'item__view__description' >
          <h4>{store}</h4> 
          <p className = 'ellipsis' > { description }</p>
          <a> View more </a>
        </div> 
        <div className = 'item__view__review' >
          <p className='ellipsis'>{description}</p>
          <em > -theGodOfIpsum </em>
        </div>
      </div>
    );
  }
}
