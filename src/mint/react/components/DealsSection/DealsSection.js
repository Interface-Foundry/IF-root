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
    fetchDeals: PropTypes.func.isRequired,
    deals: PropTypes.object.isRequired
  }

  componentWillMount() {
    const { fetchDeals } = this.props;
    fetchDeals();
  }

  componentWillReceiveProps(nextProps) {
    const { deals } = nextProps.deals;
    this.setState({
      deals
    });
  }

  renderCards() {
    const { isDropDown } = this.props;
    var { deals } = this.state;
    return deals.map((deal, i) => <li key={i}><DealCard deal={deal} small={isDropDown} /></li>);
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
