import React, { Component, PropTypes } from 'react';
import DealCard from './DealCard';

export default class Deals extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
  }

  static propTypes = {
    isDropdown: PropTypes.bool,
    deals: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    cart_id: PropTypes.string.isRequired
  }

  renderCards() {
    let { isDropdown, deals, cart_id } = this.props;
    if (isDropdown) deals = deals.slice(0, 5);
    return deals.map((deal, i) => <section key={i}><DealCard {...deal} cart_id={cart_id} isDropdown={isDropdown}/></section>);
  }

  render() {
    const { renderCards, props } = this;
    const { isDropdown } = props;
    return (
      <div>
        {(isDropdown ? '' : 'Today\'s Deals')}
        <section className={'signIn__container__page__deals' + (isDropdown ? '-small' : '')}>
          { renderCards() }
        </section>
      </div>
    );
  }
}
