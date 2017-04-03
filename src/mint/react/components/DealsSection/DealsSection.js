import React, { Component, PropTypes } from 'react';
import DealCard from './DealCard';

export default class DealsSection extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
    this.state = { deals: [] };
  }

  static propTypes = {
    isDropDown: PropTypes.bool.isRequired,
    deals: PropTypes.object.isRequired
  }

  renderCards() {
    const { isDropDown, deals } = this.props;
    return deals.deals.map((deal, i) => <li key={i}><DealCard {...deal} small={isDropDown} /></li>);
  }

  render() {
    const { renderCards } = this;
    return (
      <ul className="signIn__container__page__deals">
        { renderCards() }
      </ul>
    );
  }
}
