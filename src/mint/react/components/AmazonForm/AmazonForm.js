// react/components/AmazonForm/AmazonForm.js

import React, { Component } from 'react';
import { Field } from 'redux-form';
import SearchHistory from './SearchHistory';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../react-common/components';

export default class AmazonForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func
  }
  constructor(props) {
    super(props);
    this.renderField = ::this.renderField;
    this.onSubmitMiddleware = ::this.onSubmitMiddleware;
    this._toggleHistory = ::this._toggleHistory;
  }

  state = {
    showHistory: false
  }

  _toggleHistory = () => {
    this.setState({ showHistory: !this.state.showHistory });
  }

  onSubmitMiddleware = (values, e, state) => {
    const { _toggleHistory, props: { onSubmit } } = this;

    _toggleHistory();
    onSubmit(values, e, state);
  }

  renderField({ input, label, placeholder, handleSubmit, type, meta, meta: { touched, error, warning, submitting, active, dirty } }) {
    const { _toggleHistory, state: { showHistory } } = this;
    return (
      <div>
          <div className='form__input'>
            <input {...input} placeholder={placeholder} type={type} autoFocus autoComplete="off" spellCheck='true' onFocus={() => this.setState({showHistory: true})}/>
            <button
              className='form__input__submit'
              onClick={handleSubmit}>
              <div className='form__input__submit__description'><Icon icon='Search'/></div>
            </button>
          </div>
          {showHistory || active && dirty ? <SearchHistory filter={input.value} onChange={input.onChange} handleSubmit={handleSubmit} _toggleHistory={_toggleHistory} />:null}
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
