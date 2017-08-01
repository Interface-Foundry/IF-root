// mint/react/components/Details/Details.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../../react-common/components';
import { timeFromDate, numberOfItems, getStoreName } from '../../../utils';
import { ButtonsContainer } from '../../../containers';
import CartDescription from './CartDescription';

export default class Details extends Component {
  constructor(props) {
    super(props)

    this._countdownTimer = ::this._countdownTimer;
  }

  static propTypes = {
    cart: PropTypes.object,
    likeCart: PropTypes.func,
    unlikeCart: PropTypes.func,
    user: PropTypes.object,
    locked: PropTypes.bool,
    cloneCart: PropTypes.func,
    undoRemove: PropTypes.func,
    oldCart: PropTypes.array,
    showUndo: PropTypes.bool
  }

  state = {
    time: ''
  }

  componentWillMount() {
    this._countdownTimer()
  }

  componentWillUnmount() {
    this._countdownTimer(true)
  }

  render() {
    const { cart: { name, locked, leader, store, store_locale, members, items, thumbnail_url, updatedAt, createdAt, likes, clones, id },
              likeCart, unlikeCart, user, cloneCart, undoRemove, showUndo, cart, oldCart } = this.props,
      { time } = this.state,
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
      likedList = likes.map((id) => id),
      isAdmin = user.id === leader.id,
      storeUrl = store === 'Lotte' || store === 'Muji' ? `//www.${store.toLowerCase()}.com` : `//store.${store.toLowerCase()}.${store_locale.toLowerCase()}`,
      nextAchievement = members.length > 2 ? ( members.length > 5 ? ( members.length > 7 ? [] : [{ reqs: 10, discount: 100 }] ) : [{ reqs: 6, discount: 80 }, { reqs: 10, discount: 100 }] ) :  [{ reqs: 3, discount: 30 }, { reqs: 6, discount: 80 }];

    return (
      <table className='details'>
        <tbody>
          <tr>
            <th colSpan='100%'>
              <div className={`card`}>
                <div className='cover'>
                  <div className='left'>
                    <div className={'image'} style={{
                      backgroundImage: `url(${thumbnail_url || '//storage.googleapis.com/kip-random/kip_head_whitebg.png'})`
                    }}/>
                    <div className='text'>
                      <h1>
                        {
                          isAdmin ? <Link to={`/cart/${id}/m/edit`}>
                            {name}
                            <Icon icon='Settings'/>
                          </Link> : <div className='locked'>
                            {name}
                          </div>
                        }
                      </h1>
                      <CartDescription {...this.props} />
                      <div className='timer'>
                        <Icon icon='Timer'/>
                        <h4>{time}</h4>
                      </div>
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
                      </div>
                    ))
                  }
                  <div className='store right'>
                    <Icon icon='Upload'/>
                    <h4><a target='_blank' href={storeUrl}><span>{getStoreName(store, store_locale)}</span></a></h4>
                  </div>
                </div>
              </div>
            </th>
          </tr>
        </tbody>
      </table>
    );
  }

  _countdownTimer(stop) {
    const { cart: { createdAt } } = this.props;

    if(stop) {
      if(self)
        clearTimeout(self.timeout)

      clearTimeout(this.timeout)
    } else {
      let self = this
      self.timeout = setTimeout(() => {
        const numberOfDaysToAdd = 3;
        let createDate = new Date(createdAt);
        createDate.setDate(createDate.getDate() + numberOfDaysToAdd); 
        const countDownDate = createDate.getTime();

        // Get todays date and time
        const now = new Date().getTime();

        // Find the distance between now an the count down date
        const distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        self.setState({time: days + "d " + hours + "h " + minutes + "m " + seconds + "s "})

        if (distance < 0) {
          clearInterval(self.timeout);
        } else {
          self._countdownTimer();
        }
      }, 100);
    }
  }
}
