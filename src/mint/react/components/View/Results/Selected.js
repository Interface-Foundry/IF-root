// mint/react/components/View/Results/Selected.js
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { displayCost, getStoreName } from '../../../utils';
import { Delete } from '../../../../react-common/kipsvg';
import { Icon } from '../../../../react-common/components';

export default class Selected extends Component {

  constructor(props) {
    super(props);
    this._changeOption = ::this._changeOption;
  }

  static propTypes = {
    cart: PropTypes.object,
    item: PropTypes.object,
    inCart: PropTypes.bool,
    selectItem: PropTypes.func,
    addItem: PropTypes.func,
    arrow: PropTypes.number,
    user: PropTypes.object,
    togglePopup: PropTypes.func,
    updateItem: PropTypes.func,
    navigateLeftResults: PropTypes.func,
    navigateRightResults: PropTypes.func,
    fetchItemVariation: PropTypes.func,
    numResults: PropTypes.number,
    fetchSearchItem: PropTypes.func
  }

  state = {
    options: null
  }

  _changeOption(optionId, type) {
    const { options } = this.state;


    let newOptions = {};
    newOptions[type] = options[type];
    newOptions[type].selected = optionId;

    this.setState({
      options: {
        ...options,
        ...newOptions
      }
    })
  }

  componentWillMount() {
    const { fetchSearchItem, item } = this.props;

    this.setState({options: item.options})
  }

  componentWillReceiveProps(nextProps) {
    const { fetchSearchItem, item } = this.props;
    
    if (nextProps.item.id !== item.id) {
      fetchSearchItem(nextProps.item.id);
    }
  }

  render() {
    const { user, cart, item, numResults, inCart, selectItem, addItem, arrow, togglePopup, updateItem, navigateLeftResults, navigateRightResults, fetchItemVariation, selectOption } = this.props,
      { options } = this.state,
      { _changeOption } = this,
      optionIds = Object.keys(options).map((key, index) => options[key].selected),
      afterClass = !arrow ? 'left' : (arrow === 1 ? 'middle' : 'right');
    
    return (
      <td key={item.id} colSpan='100%' className='selected'>
        <div className={`card ${inCart ? 'incart' : ''} ${afterClass}`}>
          <div className='navigation'>
            <button className='left' onClick={() => { navigateLeftResults(); }}>
              <Icon icon='LeftChevron'/>
            </button>
            <button className='right' onClick={() => { navigateRightResults(); }}>
              <Icon icon='RightChevron'/>
            </button>
          </div>
          <button className='close' onClick={() => selectItem(null)}>
            <Delete/>
          </button>
          {
            inCart ? <span className='incart'> In Cart </span> : null
          }
          <nav>
            {item.index + 1} of {numResults}
          </nav>
          <div className={'image'} style={{
            backgroundImage: `url(${item.main_image_url})`
          }}/>
          <div className='text'>
            <h1>{item.name}</h1>
            <h4> Price: <span className='price'>{displayCost(item.price, cart.store_locale)}</span> </h4>
            <div className='action'>
              {
                !cart.locked && user.id ? <div className={`update ${inCart ? 'grey' : ''}`}>
                  <button onClick={() => item.quantity === 1 ? null : updateItem(item.id, { quantity: item.quantity - 1 })}> - </button>
                  <p>{ item.quantity }</p>
                  <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}> + </button>
                </div> : null
              }
              { !user.id  ? <button className='sticky' onClick={() => togglePopup()}>Login to Save to Cart</button> : null }
              { cart.locked && user.id ? <button disabled={true}><Icon icon='Locked'/></button> : null }
              { !cart.locked && user.id && !inCart ? <button className='sticky' onClick={() => addItem(cart.id, item.id, optionIds)}><span>✔ Save to Cart</span></button> : null}
              { !cart.locked && user.id && inCart ?<button className='sticky warn' onClick={(e) => {removeItem(cart.id, item.id);}}>Remove from Cart</button>: null}
            </div>
            {
              options ? (
                <div className='options'>
                  {
                    Object.keys(options).map((key, index) => {
                      const selected = options[key].selected || key;
                      return <select key={key} value={selected} onChange={(e) => _changeOption(e.currentTarget.value, key)}>
                        <option key={key} value={key} disabled={true}>{key}</option>
                        {
                          options[key].map((option) => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                          ))
                        }
                      </select>;
                    })
                  }
                </div>
              ) : null
            }
            {
              item.iframe_review_url ? <div className='iframe'>
                <iframe scrolling="no" src={`${item.iframe_review_url}`}/>
              </div> : null
            }
            <div className='text__expanded'>
              <span><a href={`/api/item/${item.id}/clickthrough`} target="_blank">View on {getStoreName(cart.store, cart.store_locale)}</a></span>
              <div>
                {item.description}
              </div>
            </div>
          </div>
        </div>
      </td>
    );
  }
}
