// react/components/EditCart/EditCart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { cloudinary } from '../../utils';
import ReactGA from 'react-ga';
import Image from './Image';
import { Icon } from '..';

class EditCart extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    cart: PropTypes.object,
    clearCart: PropTypes.func,
    updateCart: PropTypes.func,
    deleteCart: PropTypes.func,
    cart_id: PropTypes.string,
    history: PropTypes.object
  }

  state = {
    editingName: false,
    cartName: ''
  }

  _changeName = (e) => {
    this.setState({ cartName: e.target.value });
  }

  _saveName = () => {
    const { state: { cartName }, props: { updateCart, cart } } = this;
    ReactGA.event({
      category: 'User',
      action: 'Changed Cart Name'
    });
    updateCart({ ...cart, name: cartName });
  }

  _updateImage = async(e) => {
    const { updateCart, cart } = this.props;
    const thumbnail_url = (await cloudinary(e))
      .secure_url;
    updateCart({ ...cart, thumbnail_url });
  }

  render() {
    const {
      props: { clearCart, deleteCart, cart_id, cart, history: { replace } },
      state: { editingName },
      _changeName,
      _saveName,
      _updateImage
    } = this;

    return (
      <div className='editCart'>
        <div className="input custom src">
            <Image input={{ 
              onChange: _updateImage, 
              value: (cart ? cart.thumbnail_url : '//storage.googleapis.com/kip-random/head%40x2.png') 
            }} />
        </div>
         { 
          editingName 
          ? <div className="input name">
              <input name="name" type="text" placeholder="Add Cart Name" onChange={_changeName} value={this.state.cartName}/>
              <button onClick={()=>{this.setState({editingName: false}); _saveName();}}>Save</button>
            </div>
          : <div className="input name" onClick={()=>this.setState({editingName: true, cartName: cart.name})}>{cart ? cart.name+' ' : 'Edit Cart Name '}
              <Icon icon='Edit'/> <span className='editText'>Edit</span>
            </div>
        }
        <ul className='dangerzone'>
          <header>Danger Will Robinson!</header>
          <section>Buttons in this area can ruin your perfect cart permanently!</section>
          <ul>
            <li>
              <h2> Empty Cart </h2>
              <p>
                This will permanently remove everything from your cart!
              </p>
              <button onClick={() => {clearCart(cart_id); replace(`/cart/${cart.id}`);}}>Empty Cart</button>
            </li>
            <li>
            <h2> Delete Cart </h2>
              <p>
                This will permanently delete your cart, there's no going back from here!
              </p>
              <button onClick={()=> {replace('/newcart'); deleteCart(cart_id); }}>Delete Cart</button>
            </li>
          </ul>
        </ul>
      </div>
    );
  }
}

export default EditCart;
