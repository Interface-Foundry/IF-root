// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FlipMove from 'react-flip-move';
import { splitCartById } from '../../../reducers';
import { moveToFront } from '../../../../react-common/utils';
import { EmptyContainer } from '../../../containers';
import MemberHead from './MemberHead';
import MemberItem from './MemberItem';

export default class Cart extends Component {
  static propTypes = {
    cart: PropTypes.object,
    user: PropTypes.object,
    invoice: PropTypes.object,
    editId: PropTypes.string,
    removeItem: PropTypes.func,
    updateItem: PropTypes.func
  }

  state = {
    openCarts: []
  }

  _toggleCart = (id) => {
    const { openCarts } = this.state;
    if (openCarts.includes(id)) {
      const index = openCarts.indexOf(id);
      this.setState({ openCarts: [...openCarts.slice(0, index), ...openCarts.slice(index + 1)] });
    } else {

      this.setState({ openCarts: [...openCarts, id] });
    }
  }

  render = () => {
    const { cart, user } = this.props, { openCarts } = this.state, { _toggleCart } = this,
      userCarts = moveToFront(splitCartById(this.props, user), user.id) || [],
      isLeader = user.id === cart.leader.id;

    return (
      <table className='cart'>
        <tbody>
          {
            userCarts.map((userCart, i) => (
              <tr key={userCart.id}>
                <td colSpan='100%'>
                  <div className='card' onClick={() => openCarts.includes(userCart.id) ? _toggleCart(userCart.id) : null}>
                    <MemberHead
                      {...this.props}
                      user={userCart}
                      openCarts={openCarts}
                      isLeader={isLeader}
                      isCurrentMember={userCart.id === user.id}
                      _toggleCart={_toggleCart} />
                    {
                      !openCarts.includes(userCart.id)
                      ?  <FlipMove typeName="ul" duration={350} staggerDurationBy={30} easing="cubic-bezier(0.4, 0, 0.2, 1)"  enterAnimation="elevator" leaveAnimation="elevator">
                          {
                            userCart.items.map(item =>
                              <MemberItem
                                {...this.props}
                                key={item.id}
                                item={item}
                                isLeader={isLeader}/>
                            )
                          }
                          </FlipMove>
                      : null
                    }
                  </div>
                </td>
              </tr>
            ))
          }
          <tr>
           { userCarts.find(c => c.id === user.id) ? null : ( cart.locked ? null : <EmptyContainer /> ) }
          </tr>
        </tbody>
      </table>
    );
  }
}