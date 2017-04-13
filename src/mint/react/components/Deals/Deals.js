import React, { Component, PropTypes } from 'react';
import DealCard from './DealCard';

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
    cart_id: PropTypes.string
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
    let { deals, cart_id } = this.props;
    if (isDropdown) deals = deals.slice(0, 5);

    return deals.map((deal, i) => <li key={i}><DealCard {...deal} cart_id={cart_id} isDropdown={isDropdown} index={i}/></li>);
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
