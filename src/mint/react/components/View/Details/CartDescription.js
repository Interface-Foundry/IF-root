// react/components/View/Details/CartDescription.js

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../../react-common/components';

export default class CartDescription extends Component {
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    leader: PropTypes.object,
    updateCart: PropTypes.func
  }

  state = {
    editing: false,
    editedDescrip: ''
  }

  shouldComponentUpdate = ({ cart: { description, leader: { id: leaderId } }, user: { id: userId } }, { editing, editedDescrip }) =>
    description !== this.props.cart.description
    || leaderId !== this.props.cart.leader.id
    || userId !== this.props.user.id
    || editing !== this.state.editing
    || editedDescrip !== this.state.editedDescrip

  componentWillReceiveProps = ({ cart: { description = '' } }) => this.setState({ editedDescrip: description })

  _saveDescription = (e) => {
    const { props: { updateCart, cart }, state: { editedDescrip } } = this;
    e.stopPropagation();
    this.setState({ editing: false });
    updateCart({ ...cart, description: editedDescrip });
  }

  _updateDescription = ({ target: { value } }) => this.setState({ editedDescrip: value })

  render() {
    const {
      _saveDescription,
      _updateDescription,
      state: { editing, editedDescrip },
      props: {
        cart: { description = '', leader: { id: leaderId } },
        user: { id: userId }
      }
    } = this,
    isAdmin = userId === leaderId;

    return (
      <div 
        className='cart-description' 
        onClick={() => isAdmin ? this.setState({editing: true}) : null} 
        onBlur={()=>this.setState({editing: false})}
      >
        {
          editing 
            ? (
               <div className='cart-description__edit-wrapper'>
                 <form 
                  onSubmit={(e)=> isAdmin ? _saveDescription(e) : null}
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
                description || isAdmin ? (
                  <div className={`cart-description__text ${isAdmin ? 'is-admin' : ''}`}>
                     <p>  
                        { description || isAdmin ? <Icon icon='Chatbubble'/> : null }
                        {
                          description 
                          ? description
                          : <i>Edit Description</i> 
                        }
                    </p>  
                  </div>
                ) : null
            )
        }
      </div>
    );
  }
}
