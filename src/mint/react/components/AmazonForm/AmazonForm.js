// react/components/AmazonForm/AmazonForm.js

import React, { Component } from 'react';
import { Field } from 'redux-form';
import SearchHistory from './SearchHistory';
import { PropTypes } from 'prop-types';
import { Icon } from '..';

export default class AmazonForm extends Component {
  constructor(props) {
    super(props);
    this.renderField = ::this.renderField;
    this.onSubmitMiddleware = ::this.onSubmitMiddleware;
    this._toggleHistory = ::this._toggleHistory;
  }

  state = {
    showHistroy: false
  }

  _toggleHistory = () => {
    this.setState({showHistroy: !this.state.showHistroy})
  }

  onSubmitMiddleware = (values, e, state) => {
    const { _toggleHistory, props: { handleSubmit, onSubmit } } = this;

    _toggleHistory()
    onSubmit(values, e, state)
  }

  renderField({ input, label, placeholder, handleSubmit, type, meta, meta: { touched, error, warning, submitting, active, dirty } }) {
    const { onSubmitMiddleware, _toggleHistory, state: { showHistroy } } = this;
    return (
      <div>
          <div className='form__input'>
            <input {...input} placeholder={placeholder} type={type} autoFocus autoComplete="off" spellCheck='true' onFocus={() => this.setState({showHistroy: true})}/>
            <button
              className='form__input__submit'
              onClick={handleSubmit}>
              <div className='form__input__submit__description'><Icon icon='Search'/></div>
            </button>
          </div>
          {showHistroy || active && dirty ? <SearchHistory filter={input.value} onChange={input.onChange} handleSubmit={handleSubmit} _toggleHistory={_toggleHistory} />:null}
        </div>
    );
  }

  render() {
    const { props, renderField, onSubmitMiddleware } = this;
    const { handleSubmit, storeName } = props;
    const displayStore = storeName === 'ypo' ? 'YPO' : _.capitalize(storeName);
    
    return (
      <form onSubmit={handleSubmit(onSubmitMiddleware)} className="form">
        <Field
          name="url"
          type="string"
          placeholder={`Search or Paste ${displayStore} URL`}
          handleSubmit={handleSubmit(onSubmitMiddleware)}
          component={renderField}/>
      </form>
    );
  }
}
