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

  renderCards() {
    const { isDropdown } = this.state;
    let { deals, cart_id } = this.props;
    if (isDropdown) deals = deals.slice(0, 5);
    return deals.map((deal, i) => <section key={i}><DealCard {...deal} cart_id={cart_id} isDropdown={isDropdown} index={i}/></section>);
  }

  componentWillUnmount() {
    const { delayDropDown } = this;
    delayDropDown(true)
  }

  componentDidMount() {
    const { delayDropDown } = this;
    delayDropDown();
  }

  delayDropDown(stop) {
    const { isDropdown } = this.state

    if(stop) {
      if(self)
        clearTimeout(self.timeout)

      clearTimeout(this.timeout)
    } else {
      let self = this
      self.timeout = setTimeout(() => {
        self.setState({
          isDropdown: isDropdown
        }) 
      }, 250);
    }
  }

  render() {
    const { renderCards, delayDropDown, state: { isDropdown } } = this;
    return (
      <div>
        {(isDropdown ? '' : 'Today\'s Deals')}
        <section ref='deals' className={'deals__section' + (isDropdown ? '-small' : '')}>
          { renderCards() }
        </section>
      </div>
    );
  }
}
