import React, { Component, PropTypes } from 'react';
import DealCard from './DealCard';

export default class DealsSection extends Component {
  constructor(props) {
    super(props);
    this.renderCards = ::this.renderCards;
    this.state = {};
  }

  static propTypes = {
    isDropDown: PropTypes.bool.isRequired,
    fetchDeals: PropTypes.func.isRequired
  }

  componentWillMount() {
    const { fetchDeals } = this.props;
    const deals = fetchDeals();

    this.setState({
      deals: deals
    });
  }

  renderCards() {
    const { isDropDown } = this.props;
    const { deals } = this.state;

    return deals.map(deal => <DealCard deal={deal} small={isDropDown} />);
  }

  render() {
    const { renderCards } = this;
    return (
      <div className="signIn__container__page__deals">
        { renderCards() }
      </div>
    );
  }
}
