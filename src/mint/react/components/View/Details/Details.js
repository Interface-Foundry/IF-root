// mint/react/components/Details/Details.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../../react-common/components';
import { timeFromDate, numberOfItems } from '../../../utils';
import { ButtonsContainer } from '../../../containers';

export default class Details extends Component {

  static propTypes = {
    cart: PropTypes.object,
    likeCart: PropTypes.func,
    unlikeCart: PropTypes.func,
    user: PropTypes.object,
    locked: PropTypes.bool,
    cloneCart: PropTypes.func,
    undoRemove: PropTypes.func,
    redoRemove: PropTypes.func,
    oldCart: PropTypes.array,
    showUndo: PropTypes.number,
    showRedo: PropTypes.number
  }

  render() {
    const {
      cart: { name, leader, store, store_locale, members, items, thumbnail_url, updatedAt, createdAt, likes, clones, id },
      likeCart,
      unlikeCart,
      user,
      locked,
      cloneCart,
      undoRemove,
      redoRemove,
      showUndo,
      showRedo,
      cart,
      oldCart
    } = this.props,
      metrics = [{
        name: 'Members',
        icon: 'Member',
        value: members.length
      }, {
        name: 'Re-Kips',
        icon: 'Loop',
        value: clones
      }, {
        name: 'Likes',
        icon: 'Like',
        value: likes.length
      }],
      likedList = likes.map((user) => user.id);

    return (
      <table className='details'>
        <tbody>
          <tr>
            <th colSpan='100%'>
              <div className={`card ${locked ? 'locked' : ''}`}>
                <div className='cover'>
                  <div className='left'>
                    <div className={'image'} style={{
                      backgroundImage: `url(${thumbnail_url || '//storage.googleapis.com/kip-random/kip_head_whitebg.png'})`
                    }}/>
                    <div className='text'> 
                      <h1>
                        { 
                          locked ? <div className='locked'>
                            <Icon icon='Locked'/>
                            {name} 
                          </div> : <Link to={`/cart/${id}/m/edit`}>
                            {name} 
                            <Icon icon='Edit'/>
                            <span>Edit</span>
                          </Link>
                        }
                      </h1>
                      <h4>{store} {store_locale}</h4>
                      <h4>Created {timeFromDate(createdAt)} by <b>{leader.name}</b></h4>
                      <section className='undoredo'>
                        {
                          showUndo 
                            ? <div className='undo__button'><button onClick={() => undoRemove(cart, oldCart)}>Undo</button></div>
                            : null
                        }
                        {
                          showRedo
                            ? <div className='redo__button'><button onClick={() => redoRemove(cart, oldCart)}>Redo</button></div>
                            : null
                        }
                      </section>
                    </div> 
                  </div>
                  <div className='right'>
                    <ButtonsContainer/>
                  </div>
                </div>
                <div className='metrics'>
                  {
                    metrics.map((m) => (
                      <div key={m.name} className={
                          `metric 
                          ${likedList.includes(user.id) && m.name === 'Likes' ? 'red' : ''}
                          ${ m.name !== 'Members' ? 'cursor' : '' }` 
                        } onClick={() => {
                          m.name === 'Likes' ? ( likedList.includes(user.id) ? unlikeCart(id) : likeCart(id) ) : m.name === 'Re-Kips' ? cloneCart(id): null;
                        }}>
                        <div className='top'>
                          <Icon icon={m.icon}/>
                          <p>{m.value}</p>
                        </div>
                        <div className='sub'>
                          <h4>{m.name}</h4>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </th>
          </tr>
          <tr>
            <td>
              <nav>
                <p> {numberOfItems(items)} items in cart <span className='updated'>❄ Updated {timeFromDate(updatedAt)}</span>  </p>
              </nav>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}
