import React, { PropTypes, Component } from 'react';
import Footer from './Footer';

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
    addItem: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
  }

  componentWillMount() {
    const { props: { item_id, previewItem, item, type, items, fetchDeals } } = this;
    // only update item if there isn't one
    if (item_id && !item.price) previewItem(item_id);

    if(type === 'deal' && items.length === 0) fetchDeals();
  }

  componentWillReceiveProps(nextProps) {
    const { props: { item_id, previewItem, item } } = this;

    if(nextProps.item_id !== item_id)
      previewItem(nextProps.item_id);
  }

  componentWillUnmount() {
    const { props: { clearItem } } = this;
    clearItem();
  }

  _handleSwipe = () => {
    this.setState({x})
  }

  render() {
    const {
      props: {
        cart_id,
        addItem,
        type,
        items,
        index,
        item,
        item: { name, main_image_url, price, store, description, id: uniq_id },
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
        onTouchStart={(e) => this.setState({originalx: e.changedTouches[e.changedTouches.length - 1].pageX})}
        onTouchMove={(e) => this.setState({x: e.changedTouches[e.changedTouches.length - 1].pageX})}
        onTouchEnd={(e) => {
          if(type === 'deal') {
            const numericInt = parseInt(index),
                  newIndex = originalx > x ? ( numericInt === items.length - 1 ? 0 : numericInt + 1 ) : ( numericInt === 0 ? items.length - 1 : numericInt - 1 );

            if(originalx !== x && x !== 0) replace(`/cart/${cart_id}/m/${type}/${newIndex}/${items[newIndex].asin}`)
          }
        }}>
        <section className='item__view'>
          <div className='item__view__image image row'
            style={ { backgroundImage: `url(${main_image_url})`, height: 150 } }/>
          <div className='item__view__atts'>
            <p>Item: {name}</p>
          </div>
          <div className='item__view__price'>
            <h4>${price}</h4>
            <p>Price: <span>${price + 40}</span> ($40 off)</p>
          </div>
          <div className='item__view__description'>
            <p>{store}</p>
            <p className='ellipsis'>{description}</p>
            <a>View more</a>
          </div>
          <div className='item__view__review'>
            <p className='ellipsis'>{description}</p>
            <p> - theGodOfIpsum</p>
          </div>
        </section>
        <Footer replace={replace} addItem={addItem} cart_id={cart_id} uniq_id={uniq_id}/>
      </div>
    );
  }
}
