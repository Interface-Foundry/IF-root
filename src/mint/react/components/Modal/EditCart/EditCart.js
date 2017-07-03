// react/components/modal/EditCart/EditCart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { cloudinary } from '../../../utils';
import ReactGA from 'react-ga';
import Image from './Image';
import { Icon } from '../../../../react-common/components';

class EditCart extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    cart: PropTypes.object,
    clearCart: PropTypes.func,
    updateCart: PropTypes.func,
    updatePrivacy: PropTypes.func,
    deleteCart: PropTypes.func,
    cart_id: PropTypes.string,
    history: PropTypes.object,
    privacyLevel: PropTypes.object,
    prevCartId: PropTypes.string
  }

  state = {
    editingName: false,
    editingDescrip: false,
    cartName: ''
  }

  _changeName = (e) => {
    this.setState({ cartName: e.target.value });
  }

  _saveName = () => {
    const { state: { cartName }, props: { updateCart, cart } } = this;
    ReactGA.event({
      category: 'Cart',
      action: 'Name'
    });
    updateCart({ ...cart, name: cartName });
  }

  _updateImage = async(e) => {
    const { updateCart, cart } = this.props;
    const thumbnail_url = (await cloudinary(e))
      .secure_url;
    ReactGA.event({
      category: 'Cart',
      action: 'Image'
    });
    updateCart({ ...cart, thumbnail_url });
  }

  _updatePrivacy = (e) => {
    const { updatePrivacy, cart } = this.props;
    ReactGA.event({
      category: 'Cart',
      action: 'Privacy'
    });
    updatePrivacy(cart.id, e.target.value);
  }

  render() {
    const {
      props: { clearCart, deleteCart, cart_id, cart, history: { push } },
      state: { editingName, editingDescrip },
      _changeName,
      _saveName,
      _updateImage,
      _updatePrivacy
    } = this;

    return (
      <div className='editCart'>
        <div className="input custom src">
            <Image input={{
              onChange: _updateImage,
              value: (cart ? cart.thumbnail_url : '//storage.googleapis.com/kip-random/kip_head_whitebg.png')
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
        {
          editingDescrip 
            ? (
               <div className='cart-description__edit-wrapper'>
                 <form 
                  onSubmit={(e)=> _saveDescription(e) }
                 >
                  <input
                    type='text'
                    onChange={(e)=>_updateDescription(e)}
                    placeholder='Enter a short description'
                    value={editedDescrip} 
                    autoFocus
                  />
                  <input 
                    type='submit'
                    disabled={editedDescrip.length > 140} 
                    onMouseDown={(e)=> editedDescrip.length <= 140 ? _saveDescription(e) : null}
                    value='Save'
                  />
                 </form>
                 <p className={editedDescrip.length < 110 ? '' : editedDescrip.length > 140 ? 'red' : 'yellow' }>
                    {editedDescrip.length}/140
                 </p>
               </div>
              )
            : (
                cart.description || isAdmin ? (
                  <div className={`cart-description__text is-admin`}>
                     <p>  
                        { cart.description || isAdmin ? <Icon icon='Chatbubble'/> : null }
                        {
                          cart.description 
                          ? cart.description
                          : <i>Edit Description</i> 
                        }
                    </p>  
                  </div>
                ) : null
            )
        }
        <div className='privacy'>
          <label> Privacy: </label>
          <select onChange={_updatePrivacy} value={cart.privacy}>
            <option value='public'>Public - Anyone with link can join this cart</option>
            <option value='private'>Private - Only those with the same email domain (i.e. kipthis.com in chris@kipthis.com) can view the cart</option>
            <option value='display'>Display - Only the leader can add items to the cart, but anyone with a link can see it</option>
          </select>
        </div>
        <div className='pad'/>
        <table className='dangerzone'>
          <caption>
            <h1 className='danger'>Danger Zone</h1>
            <h3>Buttons in this area can ruin your perfect cart permanently!</h3>
          </caption>
          <tbody>
            <tr>
              <td>
                <h2>Empty Cart</h2>
                <p>This will permanently remove everything from your cart!</p>
              </td>
              <td>
                <button onClick={() => {clearCart(cart_id); push(`/cart/${cart.id}`);}}>Empty Cart</button>
              </td>
            </tr>
            <tr>
              <td>
                <h2>Delete Cart</h2>
                <p>This will permanently delete your cart, there&lsquo;s no going back from here!</p>
              </td>
              <td>
                <button onClick={()=> deleteCart(cart_id)}>Delete Cart</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default EditCart;
