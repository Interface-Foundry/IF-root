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
    item: PropTypes.object.isRequired
  }

  render() {
    const { item: { original_link, quantity, updatedAt }, member: { email_address }, history: { replace }, cart_id } = this.props,
          memberName = getNameFromEmail(email_address);

    return (
      <div className='item'>
        <Header replace={replace} cart_id={cart_id}/>
        <section className='item__view'>
          <div className='item__view__image image row' style={
            {
              backgroundImage: `url(//placehold.it/100x100)`,
              height: 150,
            }}/>
          <div className='item__view__atts'>
            <h4>{memberName}</h4>
            <p>Item: Ipsum Lorem</p>
          </div>
          <div className='item__view__price'>
            <h4>$OMG ORIGINAL PRICE</h4>
            <p>Price: <span>Lame old price</span> (%2500 off)</p>
          </div>
          <div className='item__view__description'>
            <p>Size: a size string probably</p>
            <p>SALES OWNER?</p>
            <p className='ellipsis'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla velit enim, dictum vel sem a, malesuada facilisis lacus. Nullam iaculis, ex in hendrerit interdum, erat tellus tempor risus, vitae iaculis nulla odio ac enim. Donec nisi dolor, rutrum vel laoreet vitae, fringilla et ipsum. Donec scelerisque suscipit augue. Pellentesque at imperdiet mauris. Nulla mi odio, accumsan eu varius quis, aliquam vel nisl. Phasellus maximus ac quam quis blandit. Aliquam pharetra auctor ligula in dapibus. Vivamus egestas finibus turpis, ac fermentum orci porta a. Integer sed congue sapien, ac consequat diam. Nullam elementum metus sed elit rhoncus, in consequat neque tincidunt. Mauris accumsan ac arcu in suscipit. Sed pretium sed massa non semper. Curabitur ullamcorper a justo non posuere.</p>
            <a>View more</a>
          </div>
          <div className='item__view__review'>
            <p className='ellipsis'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla velit enim, dictum vel sem a, malesuada facilisis lacus. Nullam iaculis, ex in hendrerit interdum, erat tellus tempor risus, vitae iaculis nulla odio ac enim. Donec nisi dolor, rutrum vel laoreet vitae, fringilla et ipsum. Donec scelerisque suscipit augue. Pellentesque at imperdiet mauris. Nulla mi odio, accumsan eu varius quis, aliquam vel nisl. Phasellus maximus ac quam quis blandit. Aliquam pharetra auctor ligula in dapibus. Vivamus egestas finibus turpis, ac fermentum orci porta a. Integer sed congue sapien, ac consequat diam. Nullam elementum metus sed elit rhoncus, in consequat neque tincidunt. Mauris accumsan ac arcu in suscipit. Sed pretium sed massa non semper. Curabitur ullamcorper a justo non posuere.</p>
            <p> - theGodOfIpsum</p>
          </div>
        </section>
        <Footer/>
      </div>
    );
  }
}
