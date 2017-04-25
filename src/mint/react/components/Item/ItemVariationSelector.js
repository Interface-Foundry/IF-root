// react/components/Item/ItemVariationSelector.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ItemVariationSelector extends Component {
  constructor(props) {
    super(props);
    this.getOptions = ::this.getOptions;
    this.renderDropdowns = ::this.renderDropdowns;
  }

  static propTypes = {
    options: PropTypes.array.isRequired
  }

  state = {
    optionLists: {}
  }

  getOptions(opts) {
    return opts.reduce((list, opt) => {
      const { type, name, thumbnail_url, selected, asin } = opt;
      if (!list[type]) list[type] = [];
      list[type] = [...list[type], { name, thumbnail_url, selected, asin }];
      return list;
    }, {});
  }

  renderDropdowns() {
    const { state: { optionLists }, props } = this;
    return Object.keys(optionLists)
      .map((type) => {
        return <Dropdown key={type} name={type} choices={optionLists[type]} {...props}/>;
      });
  }

  componentWillMount() {
    const { props: { options }, getOptions } = this;
    this.setState({
      optionLists: getOptions(options)
    });
  }

  render() {
    const { renderDropdowns } = this;
    return (
      <div>
        {renderDropdowns()}
      </div>
    );
  }
}

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.updatePage = ::this.updatePage;
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    choices: PropTypes.array.isRequired,
    replace: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    defaultVal: PropTypes.string
  }

  updatePage(e) {
    const { replace, cart_id, type, index } = this.props;
    console.log(`/cart/${cart_id}/m/${type}/${index}/${e.target.value}`);

    replace(`/cart/${cart_id}/m/${type}/${index}/${e.target.value}`);

  }

  render() {
    const { props: { name, choices, defaultVal }, updatePage } = this;
    return (
      <div>
        {name}
        <select onChange={updatePage} key={name} name={name} value={defaultVal ? defaultVal : ''}>
          <option key={name} value=''>Please select a {name}</option>
          {choices.map(choice=><option key={choice.asin} value={choice.asin}>{choice.name}</option>)}
        </select>
      </div>
    );
  }
}
