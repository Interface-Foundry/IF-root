import React, { Component, PropTypes } from 'react';

export default class InputWithButton extends Component {
  render() {
    const { input: { value, onChange, placeholder, type }, changeCenter, to } = this.props
    return (
      <div className="custom__input row">
        <input className="custom__input__field" onChange={onChange} value={value} type={type} placeholder={placeholder}/>
        <button className="custom__input__button" onClick={() => changeCenter(to)}>Submit</button>
      </div>
    )
  }
}