// react/components/Item/ItemVariationSelector.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Select from 'react-select';
import './Dropdown.scss';

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
    return Object.entries(optionLists)
      .map(([name, choices]) =>
        <Dropdown 
         key={name} 
         name={name} 
         choices={
          choices.sort(
            (a, b) =>
              (a.name.toUpperCase() < b.name.toUpperCase())
              ? -1
              : (a.name.toUpperCase() > b.name.toUpperCase())
                ? 1
                : 0)
          }
          {...props}
        />);
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
      <div className='item__dropdowns'>
        Select from options below
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
    index: PropTypes.number.isRequired,
    defaultVal: PropTypes.string,
    inCart: PropTypes.bool
  }

  updatePage(choice) {
    const { replace, cart_id, inCart } = this.props;
    replace(`/cart/${cart_id}/m/${inCart ? 'cartVariant' : 'variant'}/0/${choice.asin}`);
  }

  render() {
    const { props: { name, choices, defaultVal }, updatePage } = this;
    return (
      <div className='item__dropdown'>
        <div className='select-up'>
          <Select 
            className='dropdown Select'
            onChange={updatePage}
            key={name}
            name={name}
            value={defaultVal ? defaultVal : ''}
            options={choices}
            labelKey={'name'}
            valueKey={'asin'}
            optionComponent={AmazonOption}
            valueComponent={AmazonValue}
            autoBlur={true}
            placeholder={`Choose ${name} >`.toUpperCase()}
          />
        </div>
      </div>
    );
  }
}

class AmazonValue extends Component {
  static propTypes = {
    value: PropTypes.object,
    children: PropTypes.string,
  }
  render() {
    const { value, children } = this.props;
    return (
      <div className="Select-value" title={value.name}>
        <div className="Select-value-label dropdown__option">
          <div className='dropdown__option__image' style={{backgroundImage: `url(${value.thumbnail_url})`}}/>
          {children}
        </div>
      </div>
    );
  }
}

class AmazonOption extends Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = ::this.handleMouseDown;
    this.handleMouseEnter = ::this.handleMouseEnter;
    this.handleMouseMove = ::this.handleMouseMove;
  }

  static propTypes = {
    className: PropTypes.string.isRequired,
    option: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    isFocused: PropTypes.bool.isRequired,
  }

  handleMouseDown(event) {
    const { onSelect } = this.props;
    event.preventDefault();
    event.stopPropagation();
    onSelect(this.props.option, event);
  }

  handleMouseEnter(event) {
    const { onFocus } = this.props;
    onFocus(this.props.option, event);
  }

  handleMouseMove(event) {
    const { isFocused, onFocus, option } = this.props;
    if (isFocused) return;
    onFocus(option, event);
  }

  render() {
    const { props: { className, option, children }, handleMouseDown, handleMouseEnter, handleMouseMove } = this;
    return (
      <div className={className + ' dropdown__option'}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          title={option.title}>
        <div className='dropdown__option__image' style={{backgroundImage: `url(${option.thumbnail_url})`}}/>
        {children}
      </div>
    );
  }
}