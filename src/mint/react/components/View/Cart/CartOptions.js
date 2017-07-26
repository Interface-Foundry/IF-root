// mint/react/components/View/Cart/Cart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from '../../../../react-common/components';

export default class CartOptions extends Component {

  constructor(props) {
    super(props);
    this._changeOption = ::this._changeOption;
  }

  state = {
    options: []
  }

  _changeOption(optionId, type) {
    const { options } = this.state;
    const { updateItem, item } = this.props;


    let newOptions = {};
    newOptions[type] = options[type];
    newOptions[type].selected = optionId;

    this.setState({
      options: {
        ...options,
        ...newOptions
      }
    })

    const optionIds = Object.keys(options).map((key, index) => options[key].selected);

    updateItem(item.id, {}, optionIds)
  }

  componentWillMount() {
    const { itemOptions } = this.props;
    this.setState({options: itemOptions});
  }

  componentWillReceiveProps(nextProps) {
    const { itemOptions } = this.props;
    this.setState({options: nextProps.itemOptions});
  }

  shouldComponentUpdate = ({ itemOptions }) => {
    return itemOptions !== this.props.itemOptions
  }

  render() {
    const { cart, user, item, push, itemOptions } = this.props,
      { options } = this.state,
      { _changeOption } = this,
      optionIds = Object.keys(options).map((key, index) => options[key].selected),
      imageSrc = Object.keys(options).reduce((acc, key, index) => {
        options[key].map((option, i) => {
          if (options[key].selected === option.id && option.main_image_url) {
            acc = `${key} ${option.main_image_url}`
          }
        })
        return acc;
      }, '');

    return (
      <div className='cart__options'>
        {
          Object.keys(options).map((key, index) => {
            const selected = options[key].selected || key;
            return <span className='selectBox' key={key}>
              <span className='type'>{key}</span>
              <select className={imageSrc.split(' ')[0] === key ? 'miniImage' : ''} value={selected} onChange={(e) => _changeOption(e.currentTarget.value, key)} style={{
                backgroundImage: `url(${imageSrc.split(' ')[0] === key ? imageSrc.split(' ')[1] : ''})`
              }}>
              {
                options[key].map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))
              }
            </select></span>;
          })
        }
      </div>
    );
  }
}
