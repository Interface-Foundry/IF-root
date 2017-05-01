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
  }

  static propTypes = {
    onBlur: PropTypes.func
  }

  renderField({ input, label, placeholder, handleSubmit, type, meta: { touched, error, warning, submitting, active } }) {
    const { onBlur } = this.props;
    return (
      <div>
          <div className='form__input'>
            <input {...input} onBlur={onBlur} placeholder={placeholder} type={type} autoFocus autoComplete="off" spellCheck='true'/>
            <button
              className='form__input__submit'
              type="submit"
              onClick={handleSubmit}>
              <div className='form__input__submit__description'><Icon icon='Search'/></div>
            </button>
          </div>
          <SearchHistory filter={input.value} onChange={input.onChange} handleSubmit={handleSubmit} />
        </div>
    );
  }

  render() {
    const { props, renderField } = this;
    const { handleSubmit } = props;
    return (
      <form onSubmit={handleSubmit} className="form">
        <Field
          name="url"
          type="string"
          placeholder="Paste Amazon URL or Search"
          handleSubmit={handleSubmit}
          component={renderField}/>
      </form>
    );
  }
}

// <DealsContainer isDropdown={active}/>
