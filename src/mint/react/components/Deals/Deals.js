import React, { Component, PropTypes } from 'react';
import DealCard from './DealCard';

export default class Deals extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
  }

  static propTypes = {
    isDropDown: PropTypes.bool,
    deals: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  renderCards() {
    const { isDropDown, deals, cart_id, replace, fetchItem, user_accounts } = this.props;
    return deals.map((deal, i) => <section key={i}><DealCard {...deal} fetchItem={fetchItem} cart_id={cart_id} small={isDropDown} replace={replace} user_accounts={user_accounts}/></section>);
  }

  render() {
    const { renderCards, props } = this;
    const { isDropDown } = props;
    return (
      <div>
        {(isDropDown ? '' : 'Today\'s Deals')}
        <section className={'signIn__container__page__deals' + (isDropDown ? '-small' : '')}>
          { renderCards() }
        </section>
      </div>
    );
  }
}
