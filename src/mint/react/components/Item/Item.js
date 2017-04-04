import React, { PropTypes, Component } from 'react';
import { getNameFromEmail } from '../../utils';

import Header from './Header'
import Footer from './Footer'

export default class Item extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    leader: PropTypes.object.isRequired,
    members: PropTypes.array,
    addingItem: PropTypes.bool.isRequired,
    item: PropTypes.object.isRequired,
    addItem: PropTypes.func.isRequired
  }

  render() {
    const { 
      item: { 
        original_link, 
        quantity, 
        updatedAt,
        name,
        price,
        store,
        main_image_url,
        description 
      },
      member: { email_address }, 
      history: { replace }, 
      cart_id,
      addItem 
    } = this.props,
      memberName = getNameFromEmail(email_address);

    return (
      <div className='item'>
        <Header replace={replace} cart_id={cart_id}/>
        <section className='item__view'>
          <div className='item__view__image image row' style={
            {
              backgroundImage: `url(${main_image_url})`,
              height: 150,
            }}/>
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
        <Footer addItem={addItem} replace={replace} original_link={original_link} cart_id={cart_id}/>
      </div>
    );
  }
}
