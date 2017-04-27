// react/components/Deals/Deals.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DealCard from './DealCard';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

export default class Deals extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
    this.delayDropDown = ::this.delayDropDown;
    this.state = {
      isDropdown: false
    };
  }

  static propTypes = {
    isDropdown: PropTypes.bool,
    deals: PropTypes.arrayOf(PropTypes.object)
      .isRequired,
    cart_id: PropTypes.string,
    selectDeal: PropTypes.func
  }

  componentWillUnmount() {
    const { delayDropDown } = this;
    delayDropDown(true);
  }

  componentDidMount() {
    const { delayDropDown } = this;
    delayDropDown();
  }

  delayDropDown(stop) {
    const { props: { isDropdown } } = this;

    if (stop) {
      if (self) clearTimeout(self.timeout);
      clearTimeout(this.timeout);
    } else if (this.refs.deals) {
      let self = this;
      self.timeout = setTimeout(() => {
        self.setState({
          isDropdown: isDropdown
        });
        self.delayDropDown();
      }, 100);
    } else {
      if (self) clearTimeout(self.timeout);
      clearTimeout(this.timeout);
    }
  }

  renderCards() {
    const { isDropdown } = this.state;
    let { deals, cart_id, selectDeal } = this.props;
    if (isDropdown) deals = deals.slice(0, 5);

    const activeDeals = deals.map((deal, i) => <li key={deal.id} onClick={(e) => selectDeal(i, deal)}><DealCard {...deal} cart_id={cart_id} isDropdown={isDropdown} index={i}/></li>);

    return (
      <CSSTransitionGroup
        transitionName="dealsItem"
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}>
        {activeDeals}
      </CSSTransitionGroup>
    );
  }

  render() {
    const { renderCards, state: { isDropdown } } = this;
    return (
      <div>
        <ul ref='deals' className={'deals__section' + (isDropdown ? '-small' : '')}>
          { renderCards() }
        </ul>
      </div>
    );
  }
}
