import React, { PropTypes, Component } from 'react';
import Header from './Header';
import Footer from './Footer';

export default class Item extends Component {
  static propTypes = {
    item_id: PropTypes.string.isRequired,
    item: PropTypes.object,
    fetchItem: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    addItem: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
  }

  componentWillMount() {
    const { props: { item_id, fetchItem } } = this;
    // TODO: make it request less if the item is defined
    fetchItem(item_id);
  }

  render() {
    const {
      props: {
        cart_id,
        addItem,
        item_id,
        item: { main_image_url, memberName, price, store, description },
        history: { replace }
      }
    } = this;
    return (
      <div className='item'>
        <Header replace={replace} cart_id={cart_id}/>
        <section className='item__view'>
          <div className='item__view__image image row'
            style={ { backgroundImage: `url(${main_image_url})`, height: 150 } }/>
          <div className='item__view__atts'>
            <h4>{memberName}</h4>
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
        <Footer replace={replace} addItem={addItem} cart_id={cart_id} item_id={item_id}/>
      </div>
    );
  }
}
