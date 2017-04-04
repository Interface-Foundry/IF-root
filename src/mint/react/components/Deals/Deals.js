import React, { Component, PropTypes } from 'react';
import DealCard from './DealCard';

export default class Deals extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
    this.state = { deals: [] };
  }

  static propTypes = {
    isDropDown: PropTypes.bool,
    deals: PropTypes.object.isRequired
  }

  renderCards() {
    const { isDropDown, deals } = this.props;
    return deals.deals.map((deal, i) => <li key={i}><DealCard {...deal} small={isDropDown} /></li>);
  }

  render() {
    const { renderCards, props } = this;
    const { isDropDown } = props;
    return (
      <div>
      {(isDropDown ? '' : 'Today\'s Deals')}
      <ul className={'signIn__container__page__deals' + (isDropDown ? '-small' : '')}>
        { renderCards() }
      </ul>
      </div>
    );
  }
}
