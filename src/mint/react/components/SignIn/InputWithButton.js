import React, { Component, PropTypes } from 'react';

export default class InputWithButton extends Component {

  static propTypes = {
    input: PropTypes.object.isRequired,
    meta: PropTypes.object.isRequired,
    submit: PropTypes.func,
    type: PropTypes.string.isRequired
  }

  render() {
    const { input, meta: { error }, submit, type } = this.props;

    return (
      <div className={`custom__input${error ? '-error' : ''}`}>
        {error ? <em>{error}</em> : null}
        <input {...input} className='custom__input__field' type={type}/>
        {submit
          ? <button className="custom__input__button" onClick={submit}>Submit</button>
          : <button className="custom__input__button" onClick={(e) => {
            e.preventDefault();
            e.target.blur();
          }}>Submit</button>}
      </div>
    )
  }
}
