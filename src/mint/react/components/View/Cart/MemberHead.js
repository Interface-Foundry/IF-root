import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from '../../../../react-common/components';
import { calculateItemTotal, displayCost, timeFromDate, numberOfItems } from '../../../utils';
import { ItemPaidButtonContainer } from '../../../containers';

export default class MemberHead extends Component {
  static propTypes = {
    user: PropTypes.object,
    invoice: PropTypes.object,
    openCarts: PropTypes.array,
    memberItems: PropTypes.array,
    isLeader: PropTypes.bool,
    isCurrentMember: PropTypes.bool,
    _toggleCart: PropTypes.func
  }
  render = () => {
    const { user, invoice, openCarts, memberItems, isLeader, isCurrentMember, _toggleCart } = this.props;
    return (
      <div className='card-head'>
        {
        isLeader && !isCurrentMember
          ? (
            <h1 className='item-owner'>
              <a href={`mailto:${user.email_address}?subject=KipCart&body=`}>
                {user.name}
                <Icon icon='Email'/>
              </a>
            </h1>
          )
          : <h1 className='item-owner'>{user.name}</h1>
        }
        <ItemPaidButtonContainer />
        <h1 className='toggle-items' onClick={() => _toggleCart(user.id)}>
          <Icon icon={openCarts.includes(user.id) ? 'Up' : 'Down'}/>
        </h1>
        <h4>
          <span className='grey'>
            {numberOfItems(memberItems)} item{numberOfItems(memberItems) !== 1 ? 's' : ''} • Updated {timeFromDate(memberItems[0].updatedAt)}
          </span>
        </h4>
        { isCurrentMember
          ? <h4>
            <span className='my-price'>
              Total: <span className='price'>{displayCost(calculateItemTotal(memberItems), memberItems.price_locale)}</span> &nbsp;
            </span>
          </h4>
          : null
        }
      </div>
    );
  }
};